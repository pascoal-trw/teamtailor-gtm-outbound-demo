"use client";

import { useEffect, useRef, useState } from "react";

type Stage = {
  n: string;
  name: string;
  period: string;
  intent: string;
  actions: string[];
};

// Mapped directly to the FDA job posting's progression:
// "a progressive journey: from awareness, to first win, to regular AI integration,
//  to full workflow transformation and self-sufficiency"
const STAGES: Stage[] = [
  {
    n: "01",
    name: "Awareness",
    period: "Days 1 to 5",
    intent: "Sit, watch, map. Build context before building tools.",
    actions: [
      "Shadow 3 SDRs and 2 AEs for full days, screen recording with consent.",
      "Pull every recurring workflow into a single Miro, score by frequency x friction.",
      "Pick the top 1 pain that AI can actually solve, kill the rest for now.",
    ],
  },
  {
    n: "02",
    name: "First win",
    period: "Week 2",
    intent: "Ship ONE small tool that saves a real human 20+ minutes a day.",
    actions: [
      "Ship the highest-leverage tool, internal Notion link, one button.",
      "Demo it Friday all-hands, name the AE whose problem it solved.",
      "Measure: time saved, adoption rate, qualitative feedback in #gtm-ai.",
    ],
  },
  {
    n: "03",
    name: "Regular AI integration",
    period: "Weeks 3 to 6",
    intent: "Three to five tools across the workflow, baked into daily rituals.",
    actions: [
      "Add tools at the highest-leverage points (this demo shows 3).",
      "Embed each in the AE's existing tools: Gmail compose, HubSpot, Slack.",
      "Kill any tool with sub-30% weekly adoption, no sentimentality.",
    ],
  },
  {
    n: "04",
    name: "Full workflow transformation",
    period: "Month 2 to 3",
    intent: "Redesign the workflow around the tools, not the other way around.",
    actions: [
      "Rewrite the AE playbook + new-hire onboarding around the new toolset.",
      "Bi-weekly retro on funnel impact, adoption, and what to retire next.",
      "Open-source the playbook to Customer Success and Operations.",
    ],
  },
  {
    n: "05",
    name: "Self-sufficiency",
    period: "Month 3 plus",
    intent: "The team ships their own tools without me. My job is to leave.",
    actions: [
      "Train one internal champion per function with Claude Code + Vercel.",
      "Document the build pattern as a one-page template anyone can fork.",
      "Move to the next workflow. Repeat. Inspire and celebrate the win.",
    ],
  },
];

export function WeekOne() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!wrapRef.current) return;
    const cards =
      wrapRef.current.querySelectorAll<HTMLElement>("[data-stage-idx]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(
              (entry.target as HTMLElement).dataset.stageIdx ?? -1
            );
            setVisible((prev) => new Set(prev).add(idx));
          }
        });
      },
      { threshold: 0.35 }
    );
    cards.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="week-one"
      className="relative w-full bg-paper text-ink px-4 sm:px-8 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 sm:mb-20 max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-widest text-ink-soft mb-3 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-signal pulse-dot" />
            Week one and beyond
          </div>
          <h2 className="font-sans font-bold tracking-tighter-2 text-4xl sm:text-6xl leading-[0.9]">
            The journey,
            <br />
            <span className="font-serif italic text-signal">straight from the job description.</span>
          </h2>
          <p className="mt-6 font-sans text-base sm:text-lg text-ink-soft leading-relaxed">
            The role asks to coach each function &ldquo;from awareness, to first
            win, to regular AI integration, to full workflow transformation and
            self-sufficiency.&rdquo; This is exactly how I would run that
            playbook inside Teamtailor's GTM org, starting day one.
          </p>
        </div>

        <div ref={wrapRef} className="relative">
          {/* Vertical spine line */}
          <div
            className="absolute left-[28px] sm:left-[44px] top-3 bottom-3 w-px bg-ink/12"
            aria-hidden
          />

          <ol className="space-y-12 sm:space-y-16">
            {STAGES.map((s, i) => {
              const shown = visible.has(i);
              return (
                <li
                  key={s.n}
                  data-stage-idx={i}
                  className="relative pl-[64px] sm:pl-[100px] transition-all duration-700"
                  style={{
                    opacity: shown ? 1 : 0,
                    transform: shown ? "translateY(0)" : "translateY(18px)",
                    transitionDelay: `${(i % 3) * 60}ms`,
                  }}
                >
                  {/* Stage node */}
                  <div
                    className={`absolute left-0 top-1 flex items-center justify-center rounded-full transition-colors duration-500 ${
                      shown
                        ? "bg-signal text-paper"
                        : "bg-paper text-ink-soft border border-ink/15"
                    }`}
                    style={{ width: 56, height: 56 }}
                  >
                    <span className="font-mono text-sm font-bold">{s.n}</span>
                  </div>

                  {/* Card content */}
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6 sm:gap-10">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/70 mb-2">
                        {s.period}
                      </div>
                      <h3 className="font-sans font-bold tracking-tighter-2 text-3xl sm:text-4xl leading-[0.95]">
                        {s.name}
                      </h3>
                      <p className="mt-3 font-serif italic text-lg sm:text-xl text-ink-soft leading-snug">
                        {s.intent}
                      </p>
                    </div>
                    <ul className="space-y-3 font-sans text-base sm:text-[17px] text-ink leading-relaxed">
                      {s.actions.map((a, j) => (
                        <li key={j} className="flex gap-3">
                          <span
                            className="font-mono text-[10px] uppercase tracking-widest text-signal/80 mt-1.5 shrink-0"
                            aria-hidden
                          >
                            {String(j + 1).padStart(2, "0")}
                          </span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
