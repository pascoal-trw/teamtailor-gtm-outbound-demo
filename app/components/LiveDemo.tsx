"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Square,
  MailPlus,
  MessageSquareReply,
  ClipboardList,
} from "lucide-react";

type ToolType = "outbound" | "reply" | "brief";

const TOOLS: {
  id: ToolType;
  label: string;
  tagline: string;
  hint: string;
  Icon: typeof MailPlus;
}[] = [
  {
    id: "outbound",
    label: "Outbound",
    tagline: "Cold email, prospect to draft in 8 seconds.",
    hint: "Type a company. Stream a per-prospect cold email constrained to real Teamtailor customers + features.",
    Icon: MailPlus,
  },
  {
    id: "reply",
    label: "Reply triage",
    tagline: "Paste any reply, get the next move.",
    hint: "Paste a prospect's reply. Get a classification, the recommended play, and a ready-to-send draft response.",
    Icon: MessageSquareReply,
  },
  {
    id: "brief",
    label: "Account brief",
    tagline: "60-second prep card before the call.",
    hint: "Company name in. Out comes a discovery-call brief with the right customer reference, lead feature, and top 3 objections handled.",
    Icon: ClipboardList,
  },
];

const OUTBOUND_PRESETS = [
  { company: "Porsche", role: "Head of People", tag: "automotive" },
  { company: "Five Guys", role: "VP Talent", tag: "QSR" },
  { company: "Oatly", role: "Director, People", tag: "CPG" },
  { company: "Huel", role: "Head of Talent", tag: "DTC" },
  { company: "Arsenal FC", role: "Head of Recruitment", tag: "sports" },
  { company: "Harvey Nichols", role: "Head of People", tag: "luxury retail" },
];

const BRIEF_PRESETS = [
  { company: "Porsche", tag: "automotive luxury" },
  { company: "Arsenal FC", tag: "professional sports" },
  { company: "Five Guys", tag: "high-volume QSR" },
  { company: "Oatly", tag: "DTC consumer brand" },
  { company: "Miele", tag: "premium appliances" },
];

const REPLY_PRESETS = [
  {
    label: "Soft no, timing",
    company: "Oatly",
    text: `Hi Pascoal,

Appreciate the note. We're actually mid-implementation with Greenhouse so the timing isn't right. Maybe revisit in Q3?

Thanks,
Anna`,
  },
  {
    label: "Procurement objection",
    company: "Five Guys",
    text: `Hey,

This sounds interesting but anything new has to go through procurement and that's a 4 to 6 month process. Is there a way to trial Teamtailor without that?

Mark`,
  },
  {
    label: "Hot, wants pricing",
    company: "Huel",
    text: `Pascoal,

We're scaling People ops and our current ATS isn't keeping up. Send me pricing for 200 hires/year and a few customer refs in DTC?

Sara`,
  },
];

export function LiveDemo() {
  const [tool, setTool] = useState<ToolType>("outbound");

  // Outbound
  const [obCompany, setObCompany] = useState("");
  const [obRole, setObRole] = useState("Head of Talent");

  // Reply
  const [replyText, setReplyText] = useState("");
  const [replyCompany, setReplyCompany] = useState("");

  // Brief
  const [briefCompany, setBriefCompany] = useState("");
  const [briefNotes, setBriefNotes] = useState("");

  // Shared streaming state
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const outRef = useRef<HTMLPreElement>(null);

  const generate = useCallback(
    async (payload: Record<string, unknown>) => {
      setError(null);
      setOutput("");
      setLoading(true);
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const t = await res.text().catch(() => "");
          throw new Error(t || `HTTP ${res.status}`);
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setOutput((prev) => prev + dec.decode(value, { stream: true }));
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setError((e as Error).message || "Generation failed");
      } finally {
        setLoading(false);
        abortRef.current = null;
      }
    },
    []
  );

  useEffect(() => {
    if (!outRef.current) return;
    outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [output]);

  // When tool changes, reset output to avoid mixing types
  useEffect(() => {
    setOutput("");
    setError(null);
    if (loading) abortRef.current?.abort();
  }, [tool]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (tool === "outbound") {
      if (!obCompany.trim()) return;
      generate({ type: "outbound", company: obCompany.trim(), role: obRole.trim() });
    } else if (tool === "reply") {
      if (!replyText.trim()) return;
      generate({
        type: "reply",
        company: replyCompany.trim() || undefined,
        reply_text: replyText.trim(),
      });
    } else {
      if (!briefCompany.trim()) return;
      generate({
        type: "brief",
        company: briefCompany.trim(),
        role: briefNotes.trim() || undefined,
      });
    }
  };

  const canSubmit =
    (tool === "outbound" && obCompany.trim()) ||
    (tool === "reply" && replyText.trim()) ||
    (tool === "brief" && briefCompany.trim());

  const current = TOOLS.find((t) => t.id === tool)!;

  return (
    <section id="demo" className="relative w-full px-4 sm:px-8 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        {/* Section header */}
        <div className="mb-10 sm:mb-14">
          <div className="font-mono text-xs uppercase tracking-widest text-ink-soft mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-signal pulse-dot" />
            Live, three GTM tools, all streaming
          </div>
          <h2 className="font-sans font-bold tracking-tighter-2 text-4xl sm:text-6xl leading-[0.95]">
            Pick a workflow.
            <br />
            <span className="font-serif italic text-signal">Ship the answer.</span>
          </h2>
          <p className="mt-5 font-sans text-base sm:text-lg text-ink-soft max-w-2xl leading-relaxed">
            Three tools an AE at Teamtailor could open Monday morning. Each one
            calls Claude Opus 4.7 live, constrained to real Teamtailor customers
            and features. Same architecture, three different leverage points.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TOOLS.map((t) => {
            const active = tool === t.id;
            const Icon = t.Icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTool(t.id)}
                className={`lift rounded-full px-5 py-3 font-mono text-xs uppercase tracking-widest border transition-all flex items-center gap-2 ${
                  active
                    ? "bg-ink text-paper border-ink"
                    : "bg-paper/60 text-ink border-ink/15 hover:border-signal/60 hover:text-signal"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tool description */}
        <p className="font-mono text-xs text-ink-soft/70 mb-5 max-w-3xl">
          {current.hint}
        </p>

        {/* Inputs vary by tool */}
        <form onSubmit={onSubmit} className="mb-5">
          {tool === "outbound" && (
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_280px_auto] gap-3">
              <input
                type="text"
                value={obCompany}
                onChange={(e) => setObCompany(e.target.value)}
                placeholder="Company name, e.g. Porsche"
                disabled={loading}
                className="w-full rounded-[2rem] border border-ink/15 bg-paper px-6 py-5 text-lg font-sans focus:outline-none focus:border-signal/60 transition-colors"
              />
              <input
                type="text"
                value={obRole}
                onChange={(e) => setObRole(e.target.value)}
                placeholder="Role to email"
                disabled={loading}
                className="w-full rounded-[2rem] border border-ink/15 bg-paper px-6 py-5 text-lg font-sans focus:outline-none focus:border-signal/60 transition-colors"
              />
              {loading ? (
                <StopButton onClick={stop} />
              ) : (
                <GenerateButton disabled={!canSubmit} />
              )}
            </div>
          )}

          {tool === "reply" && (
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                value={replyCompany}
                onChange={(e) => setReplyCompany(e.target.value)}
                placeholder="Prospect company (optional, e.g. Oatly)"
                disabled={loading}
                className="w-full rounded-[2rem] border border-ink/15 bg-paper px-6 py-5 text-lg font-sans focus:outline-none focus:border-signal/60 transition-colors"
              />
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Paste the prospect's reply here..."
                disabled={loading}
                rows={5}
                className="w-full rounded-[2rem] border border-ink/15 bg-paper px-6 py-5 text-base font-sans leading-relaxed focus:outline-none focus:border-signal/60 transition-colors resize-y"
              />
              <div className="flex justify-end">
                {loading ? (
                  <StopButton onClick={stop} />
                ) : (
                  <GenerateButton disabled={!canSubmit} label="Triage" />
                )}
              </div>
            </div>
          )}

          {tool === "brief" && (
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
              <input
                type="text"
                value={briefCompany}
                onChange={(e) => setBriefCompany(e.target.value)}
                placeholder="Company name, e.g. Miele"
                disabled={loading}
                className="w-full rounded-[2rem] border border-ink/15 bg-paper px-6 py-5 text-lg font-sans focus:outline-none focus:border-signal/60 transition-colors"
              />
              <input
                type="text"
                value={briefNotes}
                onChange={(e) => setBriefNotes(e.target.value)}
                placeholder="Optional notes (size, region, signal)"
                disabled={loading}
                className="w-full rounded-[2rem] border border-ink/15 bg-paper px-6 py-5 text-lg font-sans focus:outline-none focus:border-signal/60 transition-colors"
              />
              {loading ? (
                <StopButton onClick={stop} />
              ) : (
                <GenerateButton disabled={!canSubmit} label="Brief me" />
              )}
            </div>
          )}
        </form>

        {/* Preset chips per tool */}
        <div className="flex flex-wrap gap-2 mb-8">
          <span className="font-mono text-xs text-ink-soft uppercase tracking-widest mr-2 self-center">
            Try:
          </span>

          {tool === "outbound" &&
            OUTBOUND_PRESETS.map((p) => (
              <button
                key={p.company}
                type="button"
                disabled={loading}
                onClick={() => {
                  setObCompany(p.company);
                  setObRole(p.role);
                  generate({ type: "outbound", company: p.company, role: p.role });
                }}
                className="lift rounded-full border border-ink/15 bg-paper/60 px-4 py-1.5 font-mono text-xs hover:border-signal/60 hover:text-signal disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {p.company}
                <span className="ml-2 text-ink-soft/60">/ {p.tag}</span>
              </button>
            ))}

          {tool === "reply" &&
            REPLY_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                disabled={loading}
                onClick={() => {
                  setReplyCompany(p.company);
                  setReplyText(p.text);
                  generate({
                    type: "reply",
                    company: p.company,
                    reply_text: p.text,
                  });
                }}
                className="lift rounded-full border border-ink/15 bg-paper/60 px-4 py-1.5 font-mono text-xs hover:border-signal/60 hover:text-signal disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {p.label}
                <span className="ml-2 text-ink-soft/60">/ {p.company}</span>
              </button>
            ))}

          {tool === "brief" &&
            BRIEF_PRESETS.map((p) => (
              <button
                key={p.company}
                type="button"
                disabled={loading}
                onClick={() => {
                  setBriefCompany(p.company);
                  setBriefNotes("");
                  generate({ type: "brief", company: p.company });
                }}
                className="lift rounded-full border border-ink/15 bg-paper/60 px-4 py-1.5 font-mono text-xs hover:border-signal/60 hover:text-signal disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {p.company}
                <span className="ml-2 text-ink-soft/60">/ {p.tag}</span>
              </button>
            ))}
        </div>

        {/* Streaming output area */}
        <div className="relative rounded-[2rem] border border-ink/15 bg-paper overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-ink/10 bg-off-white/40">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  loading ? "bg-signal pulse-dot" : output ? "bg-ink/60" : "bg-ink/30"
                }`}
              />
              <span className="font-mono text-xs uppercase tracking-widest text-ink-soft">
                {loading
                  ? "Claude Opus 4.7 streaming"
                  : output
                  ? `${current.label} ready`
                  : `${current.label}, idle`}
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/60">
              prompt-cached context
            </span>
          </div>

          {output || loading ? (
            <pre
              ref={outRef}
              className={`m-0 px-6 py-7 sm:px-10 sm:py-10 min-h-[360px] max-h-[640px] overflow-auto whitespace-pre-wrap font-sans text-base leading-relaxed text-ink ${
                loading ? "stream-cursor" : ""
              }`}
            >
              {output}
            </pre>
          ) : (
            <IdleSkeleton tool={tool} />
          )}

          {error && (
            <div className="px-6 py-3 border-t border-signal/30 bg-signal/5 font-mono text-xs text-signal">
              {error}
            </div>
          )}
        </div>

        <p className="mt-5 font-mono text-xs text-ink-soft/70 max-w-3xl">
          Three tools, one cached context block. The Teamtailor knowledge base
          is sent once, prompt-cached by Anthropic, then every tool re-uses it
          at ~10% the token cost. Same pattern would scale to 20 tools across
          GTM, CS, and Ops.
        </p>
      </div>
    </section>
  );
}

function GenerateButton({
  disabled,
  label = "Generate",
}: {
  disabled: boolean;
  label?: string;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="btn-magnetic rounded-[2rem] bg-signal text-paper px-7 py-5 font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:bg-ink/10 disabled:text-ink-soft/60 disabled:cursor-not-allowed disabled:before:hidden hover:text-paper"
    >
      <Sparkles className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

function StopButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-magnetic invert rounded-[2rem] bg-paper border border-ink/15 text-ink px-7 py-5 font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:text-paper"
    >
      <Square className="w-4 h-4 fill-current" />
      <span>Stop</span>
    </button>
  );
}

function IdleSkeleton({ tool }: { tool: ToolType }) {
  if (tool === "outbound") {
    return (
      <div className="px-6 py-7 sm:px-10 sm:py-10 min-h-[360px] font-sans text-base leading-relaxed text-ink-soft/40 select-none">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/35 mb-4">
          Subject: <span className="text-ink-soft/60">▌</span>
        </div>
        <div className="mb-4">Hey,</div>
        <div className="mb-4 h-[1em] w-3/4 bg-ink-soft/10 rounded" />
        <div className="mb-4 space-y-2">
          <div className="h-[1em] w-full bg-ink-soft/10 rounded" />
          <div className="h-[1em] w-[88%] bg-ink-soft/10 rounded" />
          <div className="h-[1em] w-[60%] bg-ink-soft/10 rounded" />
        </div>
        <div className="mb-4 h-[1em] w-2/3 bg-ink-soft/10 rounded" />
        <div className="h-[1em] w-40 bg-ink-soft/10 rounded" />
        <IdleFooter label="Awaiting prospect input" />
      </div>
    );
  }
  if (tool === "reply") {
    return (
      <div className="px-6 py-7 sm:px-10 sm:py-10 min-h-[360px] font-sans text-base leading-relaxed text-ink-soft/40 select-none space-y-5">
        <SkeletonSection
          title="CLASSIFICATION"
          rows={[{ w: "55%" }, { w: "30%" }, { w: "70%" }]}
        />
        <SkeletonSection title="PLAY" rows={[{ w: "85%" }, { w: "60%" }]} />
        <SkeletonSection
          title="DRAFT REPLY"
          rows={[{ w: "20%" }, { w: "92%" }, { w: "78%" }, { w: "65%" }]}
        />
        <IdleFooter label="Awaiting reply paste" />
      </div>
    );
  }
  return (
    <div className="px-6 py-7 sm:px-10 sm:py-10 min-h-[360px] font-sans text-base leading-relaxed text-ink-soft/40 select-none space-y-5">
      <SkeletonSection
        title="ACCOUNT SNAPSHOT"
        rows={[{ w: "50%" }, { w: "65%" }, { w: "78%" }, { w: "55%" }]}
      />
      <SkeletonSection
        title="WHY TEAMTAILOR WINS HERE"
        rows={[{ w: "70%" }, { w: "80%" }, { w: "92%" }]}
      />
      <SkeletonSection
        title="TOP 3 OBJECTIONS"
        rows={[{ w: "85%" }, { w: "85%" }, { w: "85%" }]}
      />
      <IdleFooter label="Awaiting account input" />
    </div>
  );
}

function SkeletonSection({
  title,
  rows,
}: {
  title: string;
  rows: { w: string }[];
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/35 mb-2">
        {title}
      </div>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div
            key={i}
            className="h-[1em] bg-ink-soft/10 rounded"
            style={{ width: r.w }}
          />
        ))}
      </div>
    </div>
  );
}

function IdleFooter({ label }: { label: string }) {
  return (
    <div className="mt-8 font-mono text-[10px] uppercase tracking-widest text-ink-soft/45 flex items-center gap-2">
      <span className="inline-block w-1.5 h-1.5 bg-signal rounded-full pulse-dot" />
      {label}
    </div>
  );
}
