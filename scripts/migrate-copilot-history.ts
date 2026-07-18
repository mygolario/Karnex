/**
 * One-time migration: moves existing chat history from the legacy
 * `Project.data.assistantData.messages` JSONB blob into the new dedicated
 * `ChatConversation` + `ChatMessage` tables introduced in the Copilot rework.
 *
 * Idempotent: sets `project.data._copilotMigrated = true` after migrating a
 * project, so re-runs are safe and won't duplicate conversations.
 *
 * Usage:
 *   npx tsx scripts/migrate-copilot-history.ts            # migrate
 *   npx tsx scripts/migrate-copilot-history.ts --dry-run   # preview only
 */

// Load env BEFORE importing prisma (tsx doesn't auto-load .env.local).
import { config } from "dotenv";
config({ path: ".env.local" });

const DRY_RUN = process.argv.includes("--dry-run");

interface LegacyMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number; // epoch ms
  followUps?: string[];
  xpReward?: number;
  actions?: any[];
  tool_call?: { name: string; status: "success" | "error"; result: any };
}

async function main() {
  // Dynamic import so prisma initializes AFTER dotenv has populated env vars.
  const { default: prisma } = await import("../lib/prisma");

  console.log(`\n=== Copilot history migration ${DRY_RUN ? "(DRY RUN)" : ""} ===\n`);

  const projects = await prisma.project.findMany({
    select: { id: true, userId: true, projectName: true, data: true },
  });

  let migratedProjects = 0;
  let skippedProjects = 0;
  let totalMessages = 0;
  let totalConversations = 0;

  for (const project of projects) {
    const data = (project.data as any) || {};
    const assistantData = data.assistantData;
    const alreadyMigrated = data._copilotMigrated === true;
    const messages: LegacyMessage[] = assistantData?.messages;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      skippedProjects++;
      continue;
    }

    if (alreadyMigrated) {
      console.log(`⏭  Skip ${project.projectName} (${project.id}) — already migrated`);
      skippedProjects++;
      continue;
    }

    // Sort by timestamp ascending to preserve order
    const sorted = [...messages].sort((a, b) => a.timestamp - b.timestamp);
    const firstUser = sorted.find((m) => m.role === "user");
    const title = firstUser
      ? firstUser.content.slice(0, 60) + (firstUser.content.length > 60 ? "…" : "")
      : "گفتگوی منتقل‌شده";

    const lastMsg = sorted[sorted.length - 1];
    const lastPreview = (lastMsg?.content || "").slice(0, 200);
    const lastAt = lastMsg?.timestamp ? new Date(lastMsg.timestamp) : new Date();

    console.log(
      `📦 ${project.projectName} (${project.id}) — ${sorted.length} messages`
    );

    if (DRY_RUN) {
      console.log(`   would create conversation "${title}" + ${sorted.length} messages`);
      totalConversations++;
      totalMessages += sorted.length;
      continue;
    }

    // Create the conversation + messages in a transaction.
    const conversation = await prisma.chatConversation.create({
      data: {
        userId: project.userId,
        projectId: project.id,
        title,
        mode: "cofounder",
        model: "google/gemini-3.5-flash",
        pinned: false,
        lastMessagePreview: lastPreview,
        lastMessageAt: lastAt,
        messages: {
          create: sorted.map((m) => ({
            role: m.role,
            content: m.content,
            followUps: m.followUps ?? undefined,
            toolCalls: m.tool_call
              ? [
                  {
                    name: m.tool_call.name,
                    status: m.tool_call.status,
                    result: m.tool_call.result,
                  },
                ]
              : undefined,
            createdAt: m.timestamp ? new Date(m.timestamp) : new Date(),
          })),
        },
      },
    });

    totalConversations++;
    totalMessages += sorted.length;
    migratedProjects++;

    // Mark project as migrated so re-runs are idempotent. Keep the legacy
    // assistantData intact for safety (greenfield OK, but we don't delete yet).
    const updatedData = { ...data, _copilotMigrated: true };
    await prisma.project.update({
      where: { id: project.id },
      data: { data: updatedData as any },
    });

    console.log(`   ✓ created conversation ${conversation.id}`);
  }

  console.log(`\n=== Done ===`);
  console.log(`Projects migrated: ${migratedProjects}`);
  console.log(`Projects skipped:  ${skippedProjects}`);
  console.log(`Conversations:     ${totalConversations}`);
  console.log(`Messages moved:    ${totalMessages}\n`);

  if (DRY_RUN) {
    console.log("(dry run — no changes were written. Re-run without --dry-run to apply.)\n");
  }

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  });
