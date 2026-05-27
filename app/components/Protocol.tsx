"use client";

import { useEffect, useRef } from "react";

const STEPS = [
  {
    n: "01",
    title: "Scrape Teamtailor's public surfaces.",
    body: "Firecrawl pulls the customer page, product page, integrations directory, and homepage. No internal access, no special permission. Just the public web.",
    accent: "spiral",
  },
  {
    n: "02",
    title: "Compress to a context cache.",
    body: "Claude Haiku 4.5 extracts customers, features, integration categories, and positioning into a single JSON. Run once. Re-billed never (prompt cache).",
    accent: "scan",
  },
  {
    n: "03",
    title: "Generate, constrained to real data.",
    body: "Opus 4.7 writes the email with the context block cached, constrained to real Teamtailor customers and features. No hallucinations. Five lines, every time.",
    accent: "wave",
  },
];

function StepGraphic({ kind }: { kind: string }) {
  if (kind === "spiral") {
    return (
      <svg viewBox="0 0 180 180" className="w-full h-full">
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.45"
          style={{ transformOrigin: "90px 90px", animation: "spin 22s linear infinite" }}
        >
          {[80, 65, 50, 35, 20].map((r, i) => (
            <circle key={i} cx="90" cy="90" r={r} />
          ))}
        </g>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </svg>
    );
  }
  if (kind === "scan") {
    return (
      <svg viewBox="0 0 180 180" className="w-full h-full">
        <g fill="currentColor" opacity="0.25">
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 8 }).map((_, c) => (
              <rect key={`${r}-${c}`} x={14 + c * 19} y={14 + r * 19} width="6" height="6" />
            ))
          )}
        </g>
        <rect x="0" width="180" y="0" height="3" fill="currentColor" opacity="0.8">
          <animate attributeName="y" from="0" to="178" dur="3s" repeatCount="indefinite" />
        </rect>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="none">
      <path
        d="M0,50 Q25,10 50,50 T100,50 T150,50 T200,50"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="400"
        strokeDashoffset="0"
        opacity="0.9"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="400"
          to="0"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

export function Protocol() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const cards = wrapRef.current.querySelectorAll<HTMLElement>("[data-step]");
    const onScroll = () => {
      if (!wrapRef.current) return;
      const wrapRect = wrapRef.current.getBoundingClientRect();
      const total = wrapRef.current.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -wrapRect.top / total));
      cards.forEach((card, i) => {
        const segs = cards.length;
        const segProgress = Math.max(0, Math.min(1, progress * segs - i));
        const nextProgress = Math.max(0, Math.min(1, progress * segs - (i + 1)));
        // Stack effect: as next card scrolls in, current one scales/blurs/fades
        const scale = 1 - nextProgress * 0.08;
        const blur = nextProgress * 8;
        const opacity = 1 - nextProgress * 0.4;
        card.style.transform = `scale(${scale})`;
        card.style.filter = `blur(${blur}px)`;
        card.style.opacity = `${opacity}`;
        // entry fade-in
        const entryO = i === 0 ? 1 : Math.max(0, Math.min(1, segProgress));
        card.style.setProperty("--entry-o", String(entryO));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="protocol" className="relative w-full bg-off-white">
      <div className="px-4 sm:px-8 pt-20 sm:pt-28">
        <div className="mx-auto max-w-6xl mb-12">
          <div className="font-mono text-xs uppercase tracking-widest text-ink-soft mb-3">
            Protocol
          </div>
          <h2 className="font-sans font-bold tracking-tighter-2 text-4xl sm:text-5xl leading-[0.95] max-w-3xl">
            Three layers,
            <br />
            <span className="font-serif italic text-signal">deterministic where it matters.</span>
          </h2>
        </div>
      </div>

      <div ref={wrapRef} className="relative" style={{ height: `${STEPS.length * 100}vh` }}>
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            data-step={i}
            className="sticky top-0 h-screen flex items-center px-4 sm:px-8"
            style={{ zIndex: i + 1 }}
          >
            <div className="mx-auto max-w-6xl w-full grid grid-cols-1 md:grid-cols-[1fr_360px] gap-10 items-center">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-widest text-signal mb-5">
                  Step {s.n}
                </div>
                <h3 className="font-sans font-bold tracking-tighter-3 text-5xl sm:text-7xl leading-[0.9] mb-7">
                  {s.title}
                </h3>
                <p className="font-sans text-lg sm:text-xl text-ink-soft max-w-xl leading-relaxed">
                  {s.body}
                </p>
              </div>
              <div className="rounded-[2rem] bg-paper border border-ink/10 p-7 aspect-square text-ink">
                <StepGraphic kind={s.accent} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
