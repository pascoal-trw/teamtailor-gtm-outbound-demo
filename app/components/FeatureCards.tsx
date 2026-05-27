"use client";

import { useEffect, useRef, useState } from "react";

const SHUFFLE_ITEMS = [
  { name: "Porsche", industry: "automotive luxury", match: "scaling premium-brand hiring" },
  { name: "Five Guys", industry: "QSR, 1,500+ locations", match: "high-volume distributed" },
  { name: "Oatly", industry: "CPG, plant-based", match: "fast-growth DTC" },
  { name: "Huel", industry: "nutrition / DTC", match: "remote-first scale" },
  { name: "Harvey Nichols", industry: "luxury retail", match: "employer brand premium" },
];

function ShufflerCard() {
  const [items, setItems] = useState(SHUFFLE_ITEMS);
  useEffect(() => {
    const t = setInterval(() => {
      setItems((prev) => {
        const next = [...prev];
        const last = next.pop()!;
        next.unshift(last);
        return next;
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <article className="bg-paper rounded-[2rem] border border-ink/10 p-7 sm:p-9 shadow-[0_2px_0_rgba(17,17,17,0.04)] relative overflow-hidden">
      <header className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/70 mb-3">
          01 / Industry matcher
        </div>
        <h3 className="font-sans font-bold tracking-tighter-2 text-2xl leading-tight">
          Picks the right customer reference, every time.
        </h3>
      </header>

      <div className="relative h-[200px]">
        {items.slice(0, 4).map((it, i) => {
          const isTop = i === 0;
          return (
            <div
              key={it.name + i}
              className="absolute inset-x-0 rounded-2xl border border-ink/15 bg-off-white overflow-hidden transition-all duration-[700ms]"
              style={{
                top: 0,
                transform: `translateY(${i * 10}px) scale(${1 - i * 0.04})`,
                opacity: isTop ? 1 : Math.max(0, 0.5 - i * 0.18),
                zIndex: 10 - i,
                transitionTimingFunction: "cubic-bezier(0.34, 1.4, 0.64, 1)",
                height: isTop ? "auto" : "100%",
                visibility: i > 2 ? "hidden" : "visible",
              }}
            >
              {isTop ? (
                <div className="p-5">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="font-sans font-semibold text-lg leading-none">
                      {it.name}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/60">
                      match
                    </span>
                  </div>
                  <div className="font-mono text-xs text-ink-soft mb-3">{it.industry}</div>
                  <div className="font-sans text-sm text-signal leading-snug">{it.match}</div>
                </div>
              ) : (
                <div className="h-full" aria-hidden />
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

const TYPED_LINES = [
  "[ctx]   teamtailor_context.json loaded (12k customers, 10 features)",
  "[infer] prospect: Porsche / automotive luxury",
  "[match] customer: Porsche (already) → fallback: Lotus, Fred Perry",
  "[match] feature: Career Site + Employer Branding",
  "[draft] streaming 384 tokens via opus-4-7",
  "[done]  email ready, 4 lines, 0 em dashes",
];

function TypewriterCard() {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const current = TYPED_LINES[lineIdx];
    if (charIdx < current.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 22);
      return () => clearTimeout(t);
    }
    const pause = setTimeout(() => {
      if (lineIdx < TYPED_LINES.length - 1) {
        setLineIdx((i) => i + 1);
        setCharIdx(0);
      } else {
        // restart
        const r = setTimeout(() => {
          setLineIdx(0);
          setCharIdx(0);
        }, 2400);
        return () => clearTimeout(r);
      }
    }, 700);
    return () => clearTimeout(pause);
  }, [lineIdx, charIdx]);

  return (
    <article className="bg-paper rounded-[2rem] border border-ink/10 p-7 sm:p-9 shadow-[0_2px_0_rgba(17,17,17,0.04)] relative overflow-hidden">
      <header className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/70 mb-3 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-signal pulse-dot" />
          02 / Live feed
        </div>
        <h3 className="font-sans font-bold tracking-tighter-2 text-2xl leading-tight">
          Watch the model reason in real time.
        </h3>
      </header>

      <div className="rounded-2xl bg-ink/95 p-5 font-mono text-[12px] leading-relaxed text-paper/90 min-h-[160px]">
        {TYPED_LINES.slice(0, lineIdx).map((l, i) => (
          <div key={i} className="opacity-70">
            {l}
          </div>
        ))}
        <div>
          {TYPED_LINES[lineIdx]?.slice(0, charIdx)}
          <span className="cursor-blink text-signal">▌</span>
        </div>
      </div>
    </article>
  );
}

function SchedulerCard() {
  const [active, setActive] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 12, y: 12 });

  useEffect(() => {
    let cancelled = false;
    const cells = [80, 200, 320]; // x positions for Tuesday and Thursday
    const cycle = async () => {
      while (!cancelled) {
        // Move to Tuesday (index 2)
        setSaved(false);
        setActive(null);
        await delay(900);
        setCursorPos({ x: 130, y: 90 });
        await delay(700);
        setActive(2);
        await delay(900);
        setCursorPos({ x: 220, y: 90 });
        await delay(600);
        setActive(4);
        await delay(900);
        // Move to Save
        setCursorPos({ x: 200, y: 175 });
        await delay(700);
        setSaved(true);
        await delay(1800);
      }
    };
    cycle();
    return () => {
      cancelled = true;
    };
  }, []);

  const days = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <article className="bg-paper rounded-[2rem] border border-ink/10 p-7 sm:p-9 shadow-[0_2px_0_rgba(17,17,17,0.04)] relative overflow-hidden">
      <header className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/70 mb-3">
          03 / Meeting CTA
        </div>
        <h3 className="font-sans font-bold tracking-tighter-2 text-2xl leading-tight">
          Always proposes next week, Tue or Thu.
        </h3>
      </header>

      <div className="relative rounded-2xl bg-off-white border border-ink/10 p-5 h-[200px] overflow-hidden">
        <div className="grid grid-cols-7 gap-2">
          {days.map((d, i) => {
            const isActive = active === i;
            return (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center font-mono text-xs transition-all duration-300 ${
                  isActive
                    ? "bg-signal text-paper border-signal scale-95"
                    : "bg-paper border border-ink/10 text-ink-soft"
                }`}
              >
                {d}
              </div>
            );
          })}
        </div>
        <div
          className={`mt-5 rounded-full px-4 py-2 text-center font-mono text-xs uppercase tracking-widest transition-colors duration-300 ${
            saved
              ? "bg-ink text-paper"
              : "bg-paper border border-ink/15 text-ink-soft"
          }`}
        >
          {saved ? "Sent ✓" : "Next week"}
        </div>
        <svg
          className="absolute pointer-events-none transition-all duration-700"
          width="22"
          height="22"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
          }}
          viewBox="0 0 22 22"
        >
          <path
            d="M2 2 L2 17 L7 12 L10 18 L13 17 L10 11 L17 11 Z"
            fill="#111"
            stroke="#fff"
            strokeWidth="1"
          />
        </svg>
      </div>
    </article>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function FeatureCards() {
  return (
    <section id="how" className="relative w-full px-4 sm:px-8 py-24 sm:py-32 bg-off-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 sm:mb-16 max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-widest text-ink-soft mb-3">
            How it works
          </div>
          <h2 className="font-sans font-bold tracking-tighter-2 text-4xl sm:text-5xl leading-[0.95]">
            Three small systems,
            <br />
            <span className="font-serif italic text-signal">one shipped email.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-7">
          <ShufflerCard />
          <TypewriterCard />
          <SchedulerCard />
        </div>
      </div>
    </section>
  );
}
