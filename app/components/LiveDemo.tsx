"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, Square } from "lucide-react";

const PRESETS: { company: string; role: string; tag: string }[] = [
  { company: "Porsche", role: "Head of People", tag: "automotive" },
  { company: "Five Guys", role: "VP Talent", tag: "QSR" },
  { company: "Oatly", role: "Director, People", tag: "CPG" },
  { company: "Huel", role: "Head of Talent", tag: "DTC" },
  { company: "Arsenal FC", role: "Head of Recruitment", tag: "sports" },
  { company: "Harvey Nichols", role: "Head of People", tag: "luxury retail" },
];

export function LiveDemo() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("Head of Talent");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const outRef = useRef<HTMLPreElement>(null);

  const generate = useCallback(async (c: string, r: string) => {
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
        body: JSON.stringify({ company: c, role: r }),
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
        const chunk = dec.decode(value, { stream: true });
        setOutput((prev) => prev + chunk);
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError((e as Error).message || "Generation failed");
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!outRef.current) return;
    outRef.current.scrollTop = outRef.current.scrollHeight;
  }, [output]);

  const stop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || loading) return;
    generate(company.trim(), role.trim() || "Head of Talent");
  };

  return (
    <section id="demo" className="relative w-full px-4 sm:px-8 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-end justify-between mb-10 sm:mb-14">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-ink-soft mb-3">
              <span className="inline-block w-2 h-2 rounded-full bg-signal pulse-dot mr-2 align-middle" />
              Live demo
            </div>
            <h2 className="font-sans font-bold tracking-tighter-2 text-4xl sm:text-6xl leading-[0.95]">
              Type a company.
              <br />
              <span className="font-serif italic text-signal">Ship the email.</span>
            </h2>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 sm:grid-cols-[1fr_280px_auto] gap-3 mb-5"
        >
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company name, e.g. Porsche"
            disabled={loading}
            className="w-full rounded-[2rem] border border-ink/15 bg-paper px-6 py-5 text-lg font-sans focus:outline-none focus:border-signal/60 transition-colors"
          />
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role to email"
            disabled={loading}
            className="w-full rounded-[2rem] border border-ink/15 bg-paper px-6 py-5 text-lg font-sans focus:outline-none focus:border-signal/60 transition-colors"
          />
          {loading ? (
            <button
              type="button"
              onClick={stop}
              className="btn-magnetic invert rounded-[2rem] bg-paper border border-ink/15 text-ink px-7 py-5 font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:text-paper"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!company.trim()}
              className="btn-magnetic rounded-[2rem] bg-signal text-paper px-7 py-5 font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:text-paper"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate</span>
            </button>
          )}
        </form>

        <div className="flex flex-wrap gap-2 mb-8">
          <span className="font-mono text-xs text-ink-soft uppercase tracking-widest mr-2 self-center">
            Try:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.company}
              type="button"
              disabled={loading}
              onClick={() => {
                setCompany(p.company);
                setRole(p.role);
                generate(p.company, p.role);
              }}
              className="lift rounded-full border border-ink/15 bg-paper/60 px-4 py-1.5 font-mono text-xs hover:border-signal/60 hover:text-signal disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {p.company}
              <span className="ml-2 text-ink-soft/60">/ {p.tag}</span>
            </button>
          ))}
        </div>

        <div className="relative rounded-[2rem] border border-ink/15 bg-paper overflow-hidden">
          <div className="flex items-center justify-between px-6 py-3 border-b border-ink/10 bg-off-white/40">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${loading ? "bg-signal pulse-dot" : "bg-ink/30"}`} />
              <span className="font-mono text-xs uppercase tracking-widest text-ink-soft">
                {loading ? "Claude Opus 4.7 streaming" : output ? "Output" : "Idle"}
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/60">
              prompt-cached context
            </span>
          </div>
          <pre
            ref={outRef}
            className={`m-0 px-6 py-7 sm:px-10 sm:py-10 min-h-[320px] max-h-[520px] overflow-auto whitespace-pre-wrap font-sans text-base leading-relaxed text-ink ${
              loading ? "stream-cursor" : ""
            }`}
          >
            {output ||
              (loading
                ? ""
                : "The generated email will appear here. Type a company name and hit Generate, or pick a preset above.")}
          </pre>
          {error && (
            <div className="px-6 py-3 border-t border-signal/30 bg-signal/5 font-mono text-xs text-signal">
              {error}
            </div>
          )}
        </div>

        <p className="mt-5 font-mono text-xs text-ink-soft/70 max-w-3xl">
          Each generation makes a real call to the Anthropic API (Claude Opus 4.7) with the
          Teamtailor context block prompt-cached for ~90% cost reduction on repeat runs.
          The model is constrained to only name real Teamtailor customers and features.
        </p>
      </div>
    </section>
  );
}
