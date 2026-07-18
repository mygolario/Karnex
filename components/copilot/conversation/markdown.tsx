"use client";

import React from "react";

/**
 * Lightweight, dependency-free Markdown renderer tuned for Persian RTL output.
 * Safe by construction: input is never injected as raw HTML — everything goes
 * through React elements. Supports headings, bold, italic, inline code, code
 * blocks, bullet/numbered lists, blockquotes, horizontal rules, links, and
 * simple tables — the subset the Copilot prompt asks the model to produce.
 */

// --- Inline parsing ---

function parseInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Token regex captures: code `..`, bold **..**, italic *..* or _.._, links [t](u)
  const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*|_[^_]+_)|(\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    const key = `${keyPrefix}-i${i++}`;

    if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="px-1.5 py-0.5 rounded bg-muted text-ai text-[12px] font-mono leading-6">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-bold text-foreground">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") || token.startsWith("_")) {
      nodes.push(
        <em key={key} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("[")) {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        const safe = href.startsWith("http") || href.startsWith("/") ? href : "#";
        nodes.push(
          <a
            key={key}
            href={safe}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ai underline underline-offset-2 hover:opacity-80"
          >
            {label}
          </a>
        );
      }
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

// --- Block parsing ---

interface Block {
  type: "p" | "h1" | "h2" | "h3" | "ul" | "ol" | "code" | "quote" | "hr" | "table";
  lines: string[];
}

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code fence
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ type: "code", lines: [lang, ...codeLines] });
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "hr", lines: [] });
      i++;
      continue;
    }

    // Headings
    if (/^###\s+/.test(trimmed)) {
      blocks.push({ type: "h3", lines: [trimmed.replace(/^###\s+/, "")] });
      i++;
      continue;
    }
    if (/^##\s+/.test(trimmed)) {
      blocks.push({ type: "h2", lines: [trimmed.replace(/^##\s+/, "")] });
      i++;
      continue;
    }
    if (/^#\s+/.test(trimmed)) {
      blocks.push({ type: "h1", lines: [trimmed.replace(/^#\s+/, "")] });
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", lines: quoteLines });
      continue;
    }

    // Table (header | sep | rows)
    if (trimmed.includes("|") && i + 1 < lines.length && /^\s*\|?[\s:-]+\|[\s:|-]+$/.test(lines[i + 1].trim())) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().includes("|")) {
        tableLines.push(lines[i].trim());
        i++;
      }
      blocks.push({ type: "table", lines: tableLines });
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", lines: items });
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", lines: items });
      continue;
    }

    // Blank line
    if (trimmed === "") {
      i++;
      continue;
    }

    // Paragraph (gather consecutive non-empty, non-special lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("```") &&
      !/^#{1,3}\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith(">") &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^(-{3,}|\*{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push({ type: "p", lines: paraLines });
    }
  }

  return blocks;
}

function splitTableRow(row: string): string[] {
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

export function Markdown({ content }: { content: string }) {
  if (!content) return null;
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-2.5 leading-8 text-[14px]">
      {blocks.map((block, bi) => {
        const key = `b${bi}`;
        switch (block.type) {
          case "h1":
            return (
              <h3 key={key} className="text-base font-bold text-foreground mt-1">
                {parseInline(block.lines[0], key)}
              </h3>
            );
          case "h2":
            return (
              <h4 key={key} className="text-sm font-bold text-foreground mt-1">
                {parseInline(block.lines[0], key)}
              </h4>
            );
          case "h3":
            return (
              <h5 key={key} className="text-[13px] font-bold text-muted-foreground mt-1">
                {parseInline(block.lines[0], key)}
              </h5>
            );
          case "p":
            return (
              <p key={key} className="text-foreground/90">
                {block.lines.map((l, li) => (
                  <React.Fragment key={`${key}-l${li}`}>
                    {li > 0 && <br />}
                    {parseInline(l, `${key}-l${li}`)}
                  </React.Fragment>
                ))}
              </p>
            );
          case "ul":
            return (
              <ul key={key} className="list-disc ps-5 space-y-1 text-foreground/90">
                {block.lines.map((l, li) => (
                  <li key={`${key}-li${li}`}>{parseInline(l, `${key}-li${li}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key} className="list-decimal ps-5 space-y-1 text-foreground/90">
                {block.lines.map((l, li) => (
                  <li key={`${key}-li${li}`}>{parseInline(l, `${key}-li${li}`)}</li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={key}
                className="border-s-2 border-ai/40 ps-3 text-muted-foreground italic"
              >
                {block.lines.map((l, li) => (
                  <p key={`${key}-q${li}`}>{parseInline(l, `${key}-q${li}`)}</p>
                ))}
              </blockquote>
            );
          case "hr":
            return <hr key={key} className="border-border/60 my-2" />;
          case "code": {
            const [, ...codeLines] = block.lines;
            return (
              <pre
                key={key}
                className="bg-muted/70 border border-border/50 rounded-xl p-3 overflow-x-auto copilot-scroll text-[12px] font-mono leading-6 text-foreground/90"
                dir="ltr"
              >
                <code>{codeLines.join("\n")}</code>
              </pre>
            );
          }
          case "table": {
            if (block.lines.length < 2) return null;
            const header = splitTableRow(block.lines[0]);
            const rows = block.lines.slice(2).map(splitTableRow);
            return (
              <div key={key} className="overflow-x-auto copilot-scroll">
                <table className="w-full text-[13px] border border-border/50 rounded-lg overflow-hidden">
                  <thead className="bg-muted/50">
                    <tr>
                      {header.map((h, hi) => (
                        <th key={hi} className="px-3 py-2 text-start font-bold border-b border-border/50">
                          {parseInline(h, `${key}-th${hi}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-border/30 last:border-0">
                        {row.map((c, ci) => (
                          <td key={ci} className="px-3 py-2 border-s border-border/20 first:border-s-0">
                            {parseInline(c, `${key}-td${ri}-${ci}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
