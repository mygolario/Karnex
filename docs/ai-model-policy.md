# AI model policy

Single source of truth: [`lib/openrouter.ts`](../lib/openrouter.ts) (`MODEL_*` + `TIER_*`).
Call sites pass `modelOverride: TIER_*` — do not hardcode OpenRouter model slugs elsewhere.

## Tier roles

| Tier | Model | Use for |
|------|--------|---------|
| `TIER_FAST` | `google/gemini-3.1-flash-lite` | Memory, insights, name suggest, break-task, refine-text, enhance-bio, section cards, content ideas |
| `TIER_DEFAULT` | `google/gemini-3.5-flash` | Canvas, chat, copilot tools, most content/ops narratives, multi-pass **draft** |
| `TIER_REASONING` | `anthropic/claude-sonnet-5` | Genesis core plan, pitch-deck assemble, validate-idea **refine** (and single-pass fallbacks) |
| `TIER_GROUNDED` | `perplexity/sonar` | Market research (standard), pitch scorecard |
| `TIER_GROUNDED_PRO` | `perplexity/sonar-pro` | Competitor discovery |
| `TIER_GROUNDED_DEEP` | `perplexity/sonar-deep-research` | Deep TAM/SAM/SOM only |
| `TIER_STT` | `openai/whisper-large-v3` | Speech-to-text |

Reserved / unused in product: `TIER_LOCATION` (feature removed), `TIER_IMAGE` (route disabled).

## Quality pattern

High-stakes flows prefer **Flash draft → Claude refine** (`multiPassGenerate` with `refineModelOverride: TIER_REASONING`).
Do **not** put Claude in the Copilot multi-turn tool loop — keep Flash for tool calling cost/latency.

## Credits

Feature-weighted credits live in [`lib/ai/credit-weights.ts`](../lib/ai/credit-weights.ts).
Deep market research must be charged as `market-research-deep` (action `generate-market-research` + `deep: true`).

## Embeddings

RAG uses HuggingFace `BAAI/bge-m3` (`lib/ai/embeddings.ts`), not OpenRouter.
