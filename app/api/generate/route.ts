import Anthropic from "@anthropic-ai/sdk";
import context from "../../teamtailor_context.json";

export const runtime = "nodejs";
export const maxDuration = 60;

const OPUS = "claude-opus-4-7";

// Supplemental customer list, hand-curated from the logo wall on teamtailor.com/en/customers/.
// The scraped JSON has a partial list, this adds the recognizable enterprise brands.
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

type Body = { company?: string; role?: string };

function buildSystemBlocks(): { type: "text"; text: string; cache_control: { type: "ephemeral" } }[] {
  const customers = (context as any).customers?.customers ?? [];
  const features = (context as any).product?.features ?? [];
  const positioning = (context as any).product?.positioning ?? "";
  const categories = (context as any).integrations?.integration_categories ?? [];
  const homepage = (context as any).homepage ?? {};
  const voiceAnchor = (context as any).marcus_voice_anchor ?? "";

  const teamtailorContext = `
YOU ARE AN AE AT TEAMTAILOR WRITING A COLD EMAIL.

TEAMTAILOR POSITIONING
${positioning}
Tagline: ${homepage.tagline ?? ""}

PRIMARY VALUE PROPS
${(homepage.primary_value_props ?? []).map((p: string) => `  - ${p}`).join("\n")}

CORE FEATURES (you may reference any by name)
${features.map((f: any) => `  - ${f.name}: ${f.value_prop}`).join("\n")}

INTEGRATION CATEGORIES
${categories.join(", ")}

CUSTOMERS YOU MAY NAME (real Teamtailor customers, never invent)
Scraped customer stories:
${customers.map((c: any) => `  - ${c.name}${c.industry ? " (" + c.industry + ")" : ""}${c.quote ? ' — "' + c.quote.slice(0, 140) + '"' : ""}`).join("\n")}

Visible logo wall (recognizable enterprise brands):
${LOGO_WALL.map((c) => `  - ${c.name} (${c.industry})`).join("\n")}

VOICE REFERENCE (the FDA hiring manager's writing style, mirror this tone)
${voiceAnchor}
`.trim();

  const rules = `
OUTPUT RULES, NON-NEGOTIABLE:
1. Output exactly: a subject line, blank line, greeting, blank line, email body, blank line, sign-off.
2. The greeting is exactly "Hey," with no first name.
3. Body is 4 to 5 lines max, conversational, no jargon.
4. Never use em dashes or en dashes anywhere. Use commas.
5. Name ONE real Teamtailor customer that matches the prospect's industry. Pick from the customer list above only. Never invent a customer.
6. Name ONE Teamtailor feature that maps to the prospect's likely hiring pain. Pick from the features list above only.
7. Include a meeting suggestion in the form "next week, Tuesday or Thursday".
8. Sign off as "Pascoal at Teamtailor" on its own line.
9. Do not output any meta commentary, do not explain your choices, do not wrap in code fences. Output the raw email only.

PROCESS, INTERNAL:
- Infer the prospect's industry from their company name and your training knowledge.
- Choose the closest-fit customer (industry match, then size match).
- Choose the most relevant feature (high-volume, distributed, employer brand, automation, AI co-pilot, etc.).
- Write the email in the voice of a sharp, low-pressure AE.
`.trim();

  return [
    { type: "text", text: teamtailorContext, cache_control: { type: "ephemeral" } },
    { type: "text", text: rules, cache_control: { type: "ephemeral" } },
  ];
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response("ANTHROPIC_API_KEY not set", { status: 500 });
  }

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const company = (body.company ?? "").trim();
  const role = (body.role ?? "Head of Talent").trim() || "Head of Talent";
  if (!company) {
    return new Response("company is required", { status: 400 });
  }
  if (company.length > 120) {
    return new Response("company name too long", { status: 400 });
  }

  const client = new Anthropic({ apiKey });
  const system = buildSystemBlocks();

  const userMessage = `
PROSPECT
Company: ${company}
Target role to email: ${role}

Write the cold email now. Output only the email, nothing else.
`.trim();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const response = await client.messages.stream({
          model: OPUS,
          max_tokens: 800,
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
