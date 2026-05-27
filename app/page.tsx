"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { LiveDemo } from "./components/LiveDemo";
import { FeatureCards } from "./components/FeatureCards";
import { Protocol } from "./components/Protocol";

const HERO_IMG =
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=2400&q=80";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed left-1/2 -translate-x-1/2 top-5 z-40 transition-all duration-500
        ${scrolled
          ? "bg-off-white/70 backdrop-blur-xl border border-ink/15 text-ink"
          : "bg-ink/30 backdrop-blur-md border border-paper/15 text-paper"}
        rounded-full px-2 py-2 flex items-center gap-1 sm:gap-2`}
    >
      <a
        href="#top"
        className="font-mono text-[11px] uppercase tracking-widest px-4 py-2 rounded-full lift"
      >
        Pascoal × Teamtailor
      </a>
      <a
        href="#demo"
        className="hidden sm:inline font-mono text-[11px] uppercase tracking-widest px-3 py-2 rounded-full lift"
      >
        Demo
      </a>
      <a
        href="#how"
        className="hidden sm:inline font-mono text-[11px] uppercase tracking-widest px-3 py-2 rounded-full lift"
      >
        How
      </a>
      <a
        href="#protocol"
        className="hidden sm:inline font-mono text-[11px] uppercase tracking-widest px-3 py-2 rounded-full lift"
      >
        Protocol
      </a>
      <a
        href="#hire"
        className="btn-magnetic bg-signal text-paper font-mono text-[11px] uppercase tracking-widest px-4 py-2 rounded-full"
      >
        <span>Hire me</span>
      </a>
    </nav>
  );
}

function Hero() {
  return (
    <section
      id="top"
      className="relative w-full h-[100dvh] overflow-hidden text-paper"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20" aria-hidden />
      <div className="absolute inset-0 grid-bg opacity-20" aria-hidden />

      <div className="relative h-full flex items-end">
        <div className="w-full max-w-6xl mx-auto px-6 sm:px-10 pb-16 sm:pb-24">
          <div className="font-mono text-[11px] uppercase tracking-widest mb-5 flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-signal pulse-dot" />
            Audition piece, Forward Deployed AI Accelerator
          </div>

          <h1 className="font-sans font-bold tracking-tighter-3 text-[14vw] sm:text-[8.5vw] leading-[0.85] max-w-[14ch]">
            Ship the
            <br />
            <span className="font-serif italic text-signal block">outbound.</span>
          </h1>

          <p className="mt-7 font-sans text-lg sm:text-2xl max-w-2xl text-paper/85 leading-snug">
            A live AI demo built on Teamtailor&apos;s public data, before our first call.
            <span className="text-paper/60"> Type any prospect, watch the email stream.</span>
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#demo"
              className="btn-magnetic bg-signal text-paper px-7 py-4 rounded-full font-mono text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <span>Generate an email</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#protocol"
              className="lift font-mono text-xs uppercase tracking-widest text-paper/80 hover:text-paper px-4 py-4"
            >
              See the architecture →
            </a>
          </div>

          <div className="mt-12 sm:mt-16 flex flex-wrap items-center gap-x-8 gap-y-2 font-mono text-[10px] uppercase tracking-widest text-paper/55">
            <span>Built on Claude Opus 4.7</span>
            <span>Next.js 16 + edge streaming</span>
            <span>Constrained to real Teamtailor data</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Philosophy() {
  const sectRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = sectRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setRevealed(true),
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const words1 = "Most candidates send pitches.".split(" ");
  const words2 = "I sent a shipped tool.".split(" ");

  return (
    <section
      ref={sectRef}
      id="philosophy"
      className="relative w-full bg-ink text-paper overflow-hidden py-32 sm:py-44"
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.10]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=2400&q=80)",
        }}
        aria-hidden
      />
      <div className="absolute inset-0 grid-bg opacity-10" aria-hidden />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-10">
        <div className="font-mono text-[11px] uppercase tracking-widest text-paper/50 mb-10">
          Philosophy
        </div>

        <p className="font-sans text-xl sm:text-3xl text-paper/55 leading-snug max-w-3xl">
          {words1.map((w, i) => (
            <span
              key={i}
              className="inline-block transition-all duration-700"
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? "translateY(0)" : "translateY(20px)",
                transitionDelay: `${i * 70}ms`,
              }}
            >
              {w}&nbsp;
            </span>
          ))}
        </p>

        <p className="mt-8 font-serif italic tracking-tighter-3 text-5xl sm:text-8xl leading-[0.95] max-w-5xl">
          {words2.map((w, i) => (
            <span
              key={i}
              className="inline-block transition-all duration-700"
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? "translateY(0)" : "translateY(30px)",
                transitionDelay: `${500 + i * 90}ms`,
                color: w.toLowerCase().includes("shipped") ? "var(--signal)" : undefined,
              }}
            >
              {w}&nbsp;
            </span>
          ))}
        </p>

        <p className="mt-12 font-mono text-xs text-paper/45 max-w-2xl">
          The role asks for bias toward action. Talking about agents I could build seemed
          like the wrong opening move.
        </p>
      </div>
    </section>
  );
}

function HireCTA() {
  return (
    <section
      id="hire"
      className="relative w-full bg-off-white py-28 sm:py-40 px-6 sm:px-10"
    >
      <div className="max-w-5xl mx-auto text-center">
        <div className="font-mono text-[11px] uppercase tracking-widest text-ink-soft mb-6">
          The actual ask
        </div>
        <h2 className="font-sans font-bold tracking-tighter-3 text-5xl sm:text-8xl leading-[0.9]">
          Is the FDA role
          <br />
          <span className="font-serif italic text-signal">still open?</span>
        </h2>
        <p className="mt-10 font-sans text-lg sm:text-xl text-ink-soft max-w-2xl mx-auto leading-relaxed">
          I am Pascoal Dias, an AI developer with three years building agents, automations
          and tools for recruitment agencies and ecom brands. This page is the smallest
          honest answer I could give to &ldquo;what would you ship in week one.&rdquo;
        </p>
        <div className="mt-12 flex flex-wrap gap-4 justify-center items-center">
          <a
            href="mailto:pascoal@systechly.com?subject=FDA%20role%20at%20Teamtailor"
            className="btn-magnetic bg-signal text-paper px-9 py-5 rounded-full font-mono text-sm uppercase tracking-widest flex items-center gap-3"
          >
            <Mail className="w-4 h-4" />
            <span>Reply to Pascoal</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative w-full bg-ink text-paper/80 rounded-t-[4rem] mt-0 pt-16 pb-12 px-6 sm:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr] gap-10 sm:gap-6">
        <div>
          <div className="font-sans font-bold text-2xl tracking-tighter-2 text-paper">
            Pascoal × Teamtailor
          </div>
          <div className="mt-2 font-mono text-[11px] uppercase tracking-widest text-paper/45">
            Audition artifact, May 2026
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-paper/40 mb-3">
            Site
          </div>
          <ul className="space-y-2 font-sans text-sm">
            <li><a className="lift hover:text-paper" href="#demo">Live demo</a></li>
            <li><a className="lift hover:text-paper" href="#how">How it works</a></li>
            <li><a className="lift hover:text-paper" href="#protocol">Protocol</a></li>
          </ul>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-paper/40 mb-3">
            Stack
          </div>
          <ul className="space-y-2 font-sans text-sm text-paper/70">
            <li>Claude Opus 4.7</li>
            <li>Next.js 16 (edge)</li>
            <li>Firecrawl + Python</li>
            <li>Tailwind v4 + GSAP</li>
          </ul>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-paper/40 mb-3">
            Contact
          </div>
          <ul className="space-y-2 font-sans text-sm">
            <li><a className="lift hover:text-paper flex items-center gap-2" href="mailto:pascoal@systechly.com"><Mail className="w-3.5 h-3.5" />Email</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-14 pt-6 border-t border-paper/10 flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-paper/45">
          © 2026 Pascoal Dias, Systechly
        </div>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <LiveDemo />
      <FeatureCards />
      <Protocol />
      <Philosophy />
      <HireCTA />
      <Footer />
    </main>
  );
}
