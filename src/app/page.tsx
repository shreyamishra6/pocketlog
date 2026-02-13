"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Zap, ArrowRight, ShieldCheck, Timer, LayoutDashboard, BrainCircuit } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const sections = ["hero", "features", "philosophy"];
    const ctx = gsap.context(() => {
      sections.forEach((section) => {
        ScrollTrigger.create({
          trigger: `#${section}`,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) {
              const dot = document.querySelector(`[data-section="${section}"]`);
              if (dot) {
                gsap.to(".nav-dot", { scale: 1, backgroundColor: "transparent", duration: 0.3 });
                gsap.to(dot, { scale: 1.5, backgroundColor: "oklch(var(--accent))", duration: 0.3 });
              }
            }
          },
        });
      });

      // Hero Animation
      gsap.from(".hero-title", {
        x: -100,
        opacity: 0,
        duration: 1.5,
        ease: "power4.out",
        stagger: 0.2,
      });

      gsap.from(".hero-meta", {
        y: 20,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.8,
      });

      // Feature Stagger
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 80%",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
      });

      // Section Header Reveals
      gsap.utils.toArray<HTMLElement>(".section-title").forEach((title) => {
        gsap.from(title, {
          scrollTrigger: {
            trigger: title,
            start: "top 90%",
          },
          x: -60,
          opacity: 0,
          duration: 1.2,
          ease: "power4.out",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await fetch("/api/auth/save-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          uid: result.user.uid,
        }),
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Zap className="w-12 h-12 text-accent" fill="currentColor" />
          <span className="font-mono text-[10px] uppercase tracking-[0.4em]">Initializing_System</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative min-h-screen bg-background grid-bg overflow-x-hidden pt-20">
      {/* Side Navigation Sidebar */}
      <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-[100] hidden xl:flex flex-col gap-8 items-center border-l border-foreground/10 pl-4 py-8">
        <div className="flex flex-col gap-6">
          {[
            { id: "hero", label: "01 / HOME" },
            { id: "features", label: "02 / TECH" },
            { id: "philosophy", label: "03 / MIND" }
          ].map((sec) => (
            <a key={sec.id} href={`#${sec.id}`} className="group flex items-center gap-4 relative">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-60 transition-opacity absolute left-8 whitespace-nowrap bg-background px-2 py-1 border border-foreground/5">
                {sec.label}
              </span>
              <div
                data-section={sec.id}
                className="nav-dot w-2 h-2 rounded-full border border-foreground/40 transition-all hover:border-accent"
              />
            </a>
          ))}
        </div>
      </aside>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 px-8 py-6 flex justify-between items-center bg-background/80 backdrop-blur-xl border-b border-foreground/5">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" fill="currentColor" />
          <span className="font-mono text-xs font-bold tracking-[0.3em] uppercase text-foreground">PocketLog</span>
        </div>
        <div className="flex items-center gap-12 font-mono text-[10px] uppercase tracking-[0.3em] text-foreground">
          <a href="#features" className="hover:text-accent transition-colors">01 / Features</a>
          <a href="#philosophy" className="hover:text-accent transition-colors">02 / Philosophy</a>
        </div>
      </nav>

      <main className="relative">
        {/* Hero */}
        <section id="hero" className="min-h-screen pt-48 px-8 flex flex-col justify-center">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="flex items-center gap-4 mb-8 hero-meta">
              <span className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent">Status: Available_2026</span>
              <div className="h-[1px] w-24 bg-foreground/20" />
            </div>

            <h1 className="text-[12vw] md:text-[10vw] leading-[0.85] hero-title mb-8">
              Track Daily. <br />
              <span className="text-accent italic">Log Faster.</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mt-16 hero-meta">
              <div className="md:col-span-5">
                <p className="text-xl md:text-2xl font-sans font-medium leading-tight">
                  A high-fidelity finance movement built on the 10-second rule. Zero friction, maximal awareness.
                </p>
              </div>
              <div className="md:col-start-8 md:col-span-5 flex flex-col gap-8">
                <Button
                  onClick={handleLogin}
                  className="w-fit h-auto py-6 px-12 rounded-none bg-accent text-white hover:bg-white hover:text-accent border border-accent text-2xl font-bebas transition-all"
                >
                  Log Your First Expense <ArrowRight className="ml-4 w-6 h-6" />
                </Button>
                <div className="flex items-center gap-4 text-foreground/40 font-mono text-[10px] tracking-widest uppercase">
                  <span>No Bank Links Required</span>
                  <div className="w-1 h-1 bg-accent rounded-full" />
                  <span>Privacy First</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-48 px-8 border-y border-foreground/5 bg-foreground/[0.01]">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-baseline gap-4 mb-24 section-title">
              <span className="font-mono text-[12px] text-accent font-bold">01 / FEATURE_STACK</span>
              <h2 className="text-6xl md:text-8xl">Stripped to its essence.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-foreground/10 features-grid">
              {[
                { title: "10s ENTRY", icon: Timer, desc: "Faster than thinking. Tap, Type, Log." },
                { title: "VIBE CHECK", icon: LayoutDashboard, desc: "Immediate feedback on daily leaks." },
                { title: "ZERO LEAKS", icon: ShieldCheck, desc: "No data sharing. No banking links." },
                { title: "HABIT GEN", icon: BrainCircuit, desc: "Psychological stings for behavior change." }
              ].map((f, i) => (
                <div key={i} className="bg-background feature-card p-12 group hover:bg-foreground/[0.02] transition-colors overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 font-mono text-[10px] opacity-20 group-hover:opacity-100 transition-opacity">
                    INDEX_0{i + 1}
                  </div>
                  <f.icon className="w-12 h-12 mb-12 text-accent" strokeWidth={1.5} />
                  <h3 className="text-4xl mb-4">{f.title}</h3>
                  <p className="font-sans text-sm text-foreground/60 leading-relaxed font-semibold">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section id="philosophy" className="py-64 px-8 border-b border-foreground/5 relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
              <div className="lg:col-span-12 section-title mb-32">
                <span className="font-mono text-[12px] text-accent font-bold block mb-4">03 / BRAND_PHILOSOPHY</span>
                <h2 className="text-[10vw] leading-none mb-12">Intentional <br />Friction.</h2>
              </div>

              <div className="lg:col-span-4 feature-card">
                <h3 className="text-4xl mb-8 flex items-center gap-4">
                  <div className="w-8 h-px bg-accent" /> Clutter_Kill
                </h3>
                <p className="font-sans text-xl leading-relaxed text-foreground/70 font-medium">
                  Financial stress stems from complexity. PocketLog removes the noise, bank links, and manual spreadsheets to focus solely on the act of awareness.
                </p>
              </div>

              <div className="lg:col-span-4 feature-card">
                <h3 className="text-4xl mb-8 flex items-center gap-4">
                  <div className="w-8 h-px bg-accent" /> Psychological_Sting
                </h3>
                <p className="font-sans text-xl leading-relaxed text-foreground/70 font-medium">
                  The manual entry is a feature, not a bug. By forcing you to log every transaction, we create a behavioral checkpoint that adjusts your spend in real-time.
                </p>
              </div>

              <div className="lg:col-span-4 feature-card">
                <h3 className="text-4xl mb-8 flex items-center gap-4">
                  <div className="w-8 h-px bg-accent" /> Speed_First
                </h3>
                <p className="font-sans text-xl leading-relaxed text-foreground/70 font-medium italic">
                  "Logging must be faster than thinking." If it takes more than 10 seconds, you won't do it. PocketLog is built for the immediate moment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-64 px-8 text-center bg-accent text-white relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-10" />
          <div className="max-w-[1000px] mx-auto relative z-10">
            <span className="font-mono text-[10px] uppercase tracking-[1em] mb-12 block">Final_Sequence</span>
            <h2 className="text-8xl md:text-[12vw] leading-none mb-16">READY FOR <br />CLARITY?</h2>
            <Button
              onClick={handleLogin}
              className="px-20 py-10 rounded-none bg-white text-accent hover:bg-black hover:text-white text-4xl font-bebas transition-transform hover:scale-105 active:scale-95"
            >
              Sign In With Google
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-24 px-8 border-t border-foreground/5 font-mono text-[10px] uppercase tracking-[0.2em]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <Zap className="w-4 h-4 text-accent" fill="currentColor" />
            <span>PocketLog © 2026 Archive</span>
          </div>
          <div className="flex gap-12 text-foreground/40 overflow-hidden">
            <a href="#" className="hover:text-foreground transition-colors">Manifesto</a>
            <a href="#" className="hover:text-foreground transition-colors">Security_Protocol</a>
            <a href="#" className="hover:text-foreground transition-colors">Build_Logs</a>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-accent transition-colors">Twitter // X</a>
            <a href="#" className="hover:text-accent transition-colors">Github</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
