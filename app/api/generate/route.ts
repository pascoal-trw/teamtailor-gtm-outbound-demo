import Anthropic from "@anthropic-ai/sdk";
import context from "../../teamtailor_context.json";

export const runtime = "nodejs";
export const maxDuration = 60;

const OPUS = "claude-opus-4-7";

// Logo wall, hand-curated from teamtailor.com/en/customers/.
const LOGO_WALL = [
  { name: "Porsche", industry: "automotive luxury" },
  { name: "Arsenal FC", industry: "professional sports" },
  { name: "Five Guys", industry: "QSR / fast casual restaurants" },
  { name: "Fred Perry", industry: "fashion / apparel" },
  { name: "Harvey Nichols", industry: "luxury retail department store" },
  { name: "Oatly", industry: "consumer packaged goods, plant-based" },
  { name: "Huel", industry: "consumer packaged goods, nutrition" },
  { name: "Bugaboo", industry: "consumer products, parenting" },
  { name: "Miele", industry: "premium home appliances" },
  { name: "Leroy Merlin", industry: "home improvement retail" },
  { name: "Peak Performance", industry: "outdoor / sportswear" },
  { name: "Bravissimo", industry: "lingerie / specialty apparel" },
  { name: "LAD Bible", industry: "digital media / publishing" },
  { name: "Footasylum", industry: "footwear retail" },
  { name: "Lotus", industry: "automotive performance" },
];

type ToolType = "outbound" | "reply" | "brief";
type Body = {
  type?: ToolType;
  company?: string;
  role?: string;
  reply_text?: string;
};

type SystemBlock = {
  type: "text";
  text: string;
  cache_control: { type: "ephemeral" };
};

// Build the Teamtailor context block, shared and cached across all 3 tools.
function buildContextBlock(): SystemBlock {
  const customers = (context as any).customers?.customers ?? [];
  const features = (context as any).product?.features ?? [];
  const positioning = (context as any).product?.positioning ?? "";
  const categories = (context as any).integrations?.integration_categories ?? [];
  const homepage = (context as any).homepage ?? {};

  const text = `
TEAMTAILOR KNOWLEDGE BASE (shared context for all GTM tools)

POSITIONING
${positioning}
Tagline: ${homepage.tagline ?? ""}

PRIMARY VALUE PROPS
${(homepage.primary_value_props ?? []).map((p: string) => `  - ${p}`).join("\n")}

CORE FEATURES (reference by name)
${features.map((f: any) => `  - ${f.name}: ${f.value_prop}`).join("\n")}

INTEGRATION CATEGORIES
${categories.join(", ")}

CUSTOMERS YOU MAY NAME (real Teamtailor customers, never invent)
Scraped customer stories:
${customers
  .map(
    (c: any) =>
      `  - ${c.name}${c.industry ? " (" + c.industry + ")" : ""}${
        c.quote ? ' — "' + c.quote.slice(0, 140) + '"' : ""
      }`
  )
  .join("\n")}

Visible logo wall (recognizable enterprise brands):
${LOGO_WALL.map((c) => `  - ${c.name} (${c.industry})`).join("\n")}

COMMON OBJECTIONS YOU MIGHT HEAR
  - "We just switched ATS / are mid-implementation"
  - "We're too small / too big for that"
  - "Looks like another job board"
  - "Procurement / IT will block this"
  - "We're happy with [Greenhouse / Workday / Lever]"
  - "AI in hiring is risky / regulated (EU AI Act, GDPR)"
  - "Show me ROI"
`.trim();

  return { type: "text", text, cache_control: { type: "ephemeral" } };
}

// Tool-specific rules block.
function buildToolBlock(type: ToolType): SystemBlock {
  const map: Record<ToolType, string> = {
    outbound: `
TOOL: OUTBOUND COLD EMAIL GENERATOR
You are an AE at Teamtailor writing a cold email to a prospect.

OUTPUT RULES, NON-NEGOTIABLE:
1. Output exactly: subject line, blank line, "Hey,", blank line, body (4-5 lines max), blank line, sign-off.
2. Greeting is exactly "Hey," with no first name.
3. Never use em dashes or en dashes. Use commas.
4. Name ONE real Teamtailor customer matching the prospect's industry, pulled from the KB above.
5. Name ONE Teamtailor feature mapped to their likely hiring pain.
6. Include the meeting CTA "next week, Tuesday or Thursday".
7. Sign off "Pascoal at Teamtailor" on its own line.
8. Output the raw email only. No commentary, no code fences.
`.trim(),

    reply: `
TOOL: REPLY TRIAGE
You are an AE at Teamtailor and a prospect just replied to your cold email.

YOUR JOB: in 30 seconds, classify the reply, recommend the next move, and draft the response.

OUTPUT FORMAT, EXACTLY (use these section headers):

CLASSIFICATION
  One of: POSITIVE, OBJECTION, NOT_NOW, REFERRAL, UNCLEAR, UNSUBSCRIBE
  Confidence: HIGH / MEDIUM / LOW
  One-line read: <8 word summary of what they really mean>

PLAY
  Recommended next move in one short sentence (book the meeting / handle objection X / nurture / disqualify).
  Risk to watch: <one short sentence>

DRAFT REPLY
  Write the actual reply Pascoal should send back.
  Same email rules apply: "Hey," opener, no em dashes, no first name, conversational, 3-5 lines, sign off "Pascoal at Teamtailor".
  If the prospect named an objection, address it specifically using the KB above (real customer reference + feature). If positive, just propose the meeting "next week, Tuesday or Thursday".

Do not output anything outside those three sections. No code fences.
`.trim(),

    brief: `
TOOL: 60-SECOND ACCOUNT BRIEF
You are an AE prepping for a discovery call. Build a brief Pascoal can scan in 60 seconds before dialing.

OUTPUT FORMAT, EXACTLY (use these section headers):

ACCOUNT SNAPSHOT
  Industry: <best guess>
  Size signal: <rough employee count or scale signal>
  Hiring pulse: <growing fast / steady / cutting / unknown> + one-line why
  Likely buyer titles: <2 to 3 titles>

WHY TEAMTAILOR WINS HERE
  Closest customer reference: <name from KB> (why this maps)
  Lead feature: <feature name from KB> (why it solves their pain)
  Killer line for the discovery call: <one quoteable sentence>

TOP 3 OBJECTIONS YOU WILL HEAR
  1. <objection> -> <one-line handle>
  2. <objection> -> <one-line handle>
  3. <objection> -> <one-line handle>

OPENING QUESTION
  One sharp open-ended question to start the call with.

NON-NEGOTIABLE:
- Never invent customers or features. Pull from the KB above only.
- Never use em dashes or en dashes. Use commas or hyphens.
- Be specific. Vague answers are worse than no answer.
- No code fences, no preamble, no closing notes.
`.trim(),
  };

  return { type: "text", text: map[type], cache_control: { type: "ephemeral" } };
}

function buildUserMessage(type: ToolType, body: Body): string {
  if (type === "outbound") {
    return `
PROSPECT
Company: ${body.company}
Target role to email: ${body.role || "Head of Talent"}

Write the cold email now. Output only the email.
`.trim();
  }
  if (type === "reply") {
    return `
PROSPECT REPLY
From: ${body.company || "an unnamed prospect"}

"""
${body.reply_text}
"""

Triage now. Output exactly the three sections.
`.trim();
  }
  return `
ACCOUNT
Company: ${body.company}
Optional notes: ${body.role || "(none)"}

Build the 60-second brief. Output exactly the sections defined.
`.trim();
}

function validate(type: ToolType, body: Body): string | null {
  if (type === "reply") {
    if (!body.reply_text?.trim()) return "reply_text is required";
    if (body.reply_text.length > 4000) return "reply_text too long";
    return null;
  }
  if (!body.company?.trim()) return "company is required";
  if ((body.company || "").length > 120) return "company name too long";
  return null;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response("ANTHROPIC_API_KEY not set", { status: 500 });

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const type: ToolType = (body.type as ToolType) || "outbound";
  if (!["outbound", "reply", "brief"].includes(type)) {
    return new Response("Unknown tool type", { status: 400 });
  }

  const validationError = validate(type, body);
  if (validationError) return new Response(validationError, { status: 400 });

  const client = new Anthropic({ apiKey });
  const system = [buildContextBlock(), buildToolBlock(type)];
  const userMessage = buildUserMessage(type, body);

  const maxTokens = type === "outbound" ? 800 : 1200;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const response = await client.messages.stream({
          model: OPUS,
          max_tokens: maxTokens,
          system,
          messages: [{ role: "user", content: userMessage }],
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`\n\n[stream error] ${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
