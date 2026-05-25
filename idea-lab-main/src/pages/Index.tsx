import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Bot,
  MessageCircle,
  Search,
  Zap,
  ArrowRight,
  Check,
  Crown,
  Building2,
  ChevronRight,
  Brain,
  Target,
  Megaphone,
  BarChart3,
  Shield,
  Activity,
  Users,
  Sparkles,
  X as XIcon,
  AlertTriangle,
  TrendingUp,
  Eye,
  Database,
} from "lucide-react";
import { NeeshLogo } from "@/components/NeeshLogo";

/* ═══════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════ */

function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          io.unobserve(el);
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return ref;
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? (window.scrollY / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

function useCountUp(target: number, duration = 2200) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const p = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCount(Math.floor(eased * target));
            if (p < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          io.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { count, ref };
}

/* ═══════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════ */

const floatingQuestions = [
  "What does this actually do?",
  "Who is this for?",
  "Why would I use this?",
  "How is this different?",
  "Is this solving a real problem?",
  "Do I really need this?",
  "What makes this better than alternatives?",
  "Is this worth paying for?",
  "How does this fit into my workflow?",
  "Is this too complicated?",
  "Can I trust this?",
];

const solutionSteps = [
  { label: "Ingest", icon: Database, desc: "Upload your raw idea" },
  { label: "Generate", icon: FileText, desc: "Auto-create blog & chatbot" },
  { label: "Engage", icon: MessageCircle, desc: "Collect real-world feedback" },
  { label: "Detect", icon: Search, desc: "AI surfaces blind spots" },
  { label: "Refine", icon: Zap, desc: "Improve and repeat" },
];

const coreFeatures = [
  {
    icon: FileText,
    title: "Publishable Blogs",
    desc: "Turn your idea into a live, shareable experience instantly.",
    gradient: "from-cyan-500 to-teal-400",
  },
  {
    icon: Brain,
    title: "AI Knowledge Base",
    desc: "Upload documents that train an AI to deeply understand your concept.",
    gradient: "from-indigo-500 to-blue-400",
  },
  {
    icon: Bot,
    title: "Context-Aware Chatbot",
    desc: "An AI chatbot answers visitor questions and surfaces confusion points.",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    icon: Target,
    title: "Gap Detection Engine",
    desc: "Machine learning detects blind spots and confusion patterns automatically.",
    gradient: "from-rose-500 to-pink-400",
  },
  {
    icon: Megaphone,
    title: "Cross-Promotional Engine",
    desc: "Promote your idea across relevant validation ecosystems.",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    icon: Users,
    title: "Audience Insights Matrix",
    desc: "AI-powered persona detection categorizes your audience and their intent.",
    gradient: "from-emerald-500 to-green-400",
  },
  {
    icon: Activity,
    title: "Validation Command Center",
    desc: "Real-time dashboards for Idea Health Score, clarity metrics, and engagement.",
    gradient: "from-blue-600 to-indigo-500",
  },
];

const metrics = [
  { value: 10000, label: "Ideas Analyzed", suffix: "+" },
  { value: 50000, label: "Signals Detected", suffix: "+" },
  { value: 98, label: "System Uptime", suffix: "%" },
  { value: 15, label: "Persona Models", suffix: "" },
];

const personas = [
  { name: "Founders", emoji: "🚀" },
  { name: "Freelancers", emoji: "💼" },
  { name: "Product Managers", emoji: "📋" },
  { name: "Product Designers", emoji: "🎨" },
  { name: "UX Researchers", emoji: "🔬" },
  { name: "Engineers", emoji: "⚙️" },
  { name: "Scientists", emoji: "🧪" },
  { name: "SaaS Developers", emoji: "☁️" },
  { name: "Micro SaaS Builders", emoji: "🛠️" },
  { name: "Fullstack Developers", emoji: "💻" },
  { name: "Students", emoji: "🎓" },
  { name: "Content Creators", emoji: "📝" },
  { name: "Marketers", emoji: "📊" },
  { name: "Investors", emoji: "💰" },
  { name: "Analysts", emoji: "📈" },
];

const beforeItems = [
  "Random questions everywhere",
  "Conflicting feedback",
  "No clear direction",
  "Misaligned messaging",
  "Features built on assumptions",
  "Users dropping off",
  "High confusion signals",
  "Low engagement",
  "No understanding of user intent",
];

const afterItems = [
  "Clear structured idea",
  "Aligned messaging",
  "Strong validation signals",
  "Confident decisions",
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    label: "Free",
    subtitle: "For individuals just starting out",
    icon: Sparkles,
    features: [
      "Up to 5 projects",
      "Basic AI chatbot",
      "Public feedback forms",
      "Community support",
    ],
    cta: "Get Started Free",
    popular: false,
    color: "text-slate-600",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/mo",
    label: "Pro",
    subtitle: "For professionals & growing teams",
    icon: Crown,
    features: [
      "Unlimited projects",
      "White-label branding",
      "Cross-promotion engine",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    popular: true,
    color: "text-[#09daed]",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    label: "Enterprise",
    subtitle: "For large-scale operations",
    icon: Building2,
    features: [
      "Everything in Pro",
      "Custom AI model training",
      "SLA & dedicated support",
      "Team accounts & API",
    ],
    cta: "Contact Sales",
    popular: false,
    color: "text-violet-600",
  },
];

/* ═══════════════════════════════════════════════
   STAT COUNTER COMPONENT
   ═══════════════════════════════════════════════ */
function StatCounter({ value, label, suffix }: { value: number; label: string; suffix: string }) {
  const { count, ref } = useCountUp(value, 2200);
  return (
    <div ref={ref} className="lp-metric-card">
      <div className="lp-metric-value">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-sm text-muted-foreground font-medium mt-2">{label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   NEURAL MESH NODES (Hero background)
   ═══════════════════════════════════════════════ */
function NeuralMesh() {
  const nodes = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    dur: `${6 + Math.random() * 8}s`,
    delay: `${Math.random() * 4}s`,
    angle: `${Math.random() * 360}deg`,
    dx1: `${(Math.random() - 0.5) * 30}px`,
    dy1: `${(Math.random() - 0.5) * 30}px`,
    dx2: `${(Math.random() - 0.5) * 20}px`,
    dy2: `${(Math.random() - 0.5) * 20}px`,
    dx3: `${(Math.random() - 0.5) * 15}px`,
    dy3: `${(Math.random() - 0.5) * 15}px`,
  }));

  return (
    <div className="lp-neural-mesh">
      {nodes.map((n) => (
        <div
          key={n.id}
          className="lp-mesh-node"
          style={{
            top: n.top,
            left: n.left,
            "--dur": n.dur,
            "--delay": n.delay,
            "--line-angle": n.angle,
            "--dx1": n.dx1,
            "--dy1": n.dy1,
            "--dx2": n.dx2,
            "--dy2": n.dy2,
            "--dx3": n.dx3,
            "--dy3": n.dy3,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   HEADER (inline for landing page)
   ═══════════════════════════════════════════════ */
function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "header-glass shadow-sm border-b border-border/30"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center">
            <NeeshLogo size="sm" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              Features
            </a>
            <a href="#personas" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              Personas
            </a>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              Pricing
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild className="shadow-md shadow-primary/20">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <XIcon className="w-5 h-5" /> : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-border/30 animate-fade">
            <nav className="flex flex-col gap-1">
              <a href="#features" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Features</a>
              <a href="#personas" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Personas</a>
              <Link to="/pricing" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">Pricing</Link>
              <div className="flex gap-2 mt-3 px-3">
                <Button variant="ghost" size="sm" asChild><Link to="/login">Log in</Link></Button>
                <Button size="sm" asChild><Link to="/signup">Get started</Link></Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════ */
const Index = () => {
  const scrollProgress = useScrollProgress();

  // Section refs for scroll reveal
  const problemRef = useScrollReveal(0.12);
  const solutionRef = useScrollReveal(0.12);
  const simulationRef = useScrollReveal(0.12);
  const featuresRef = useScrollReveal(0.1);
  const metricsRef = useScrollReveal(0.15);
  const personasRef = useScrollReveal(0.1);
  const transformRef = useScrollReveal(0.12);
  const pricingRef = useScrollReveal(0.1);
  const finalCtaRef = useScrollReveal(0.15);

  // Stagger refs
  const questionStaggerRef = useScrollReveal(0.1);
  const featureStaggerRef = useScrollReveal(0.08);
  const personaStaggerRef = useScrollReveal(0.05);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* 3D Background placeholder — user will provide later */}
      <div id="landing-3d-bg" />

      {/* Scroll Progress Bar */}
      <div className="lp-progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* Header */}
      <LandingHeader />

      {/* ════════════════════════════════════════════
          SECTION 1 — HERO
          ════════════════════════════════════════════ */}
      <section className="lp-section lp-hero relative pt-20">
        {/* Background elements */}
        <NeuralMesh />
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div className="lp-orb lp-orb-3" />
        <div className="lp-grid-bg" />

        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <div className="lp-hero-text">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Idea Validation
            </div>
          </div>

          <h1 className="lp-hero-text-delay text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
            You Don't Need a Better Idea.{" "}
            <br className="hidden sm:block" />
            <span className="lp-gradient-text">
              You Need to See It Clearly.
            </span>
          </h1>

          <p className="lp-hero-text-delay2 text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            Understand what people actually get, what they don't, and why your idea isn't landing — <strong className="text-foreground">before you build it.</strong>
          </p>

          <div className="lp-hero-text-delay3 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="group text-base h-13 px-10 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
              <Link to="/signup">
                Start Validating for Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base h-13 px-10">
              <a href="#solution">See How It Works</a>
            </Button>
          </div>

          <div className="lp-hero-text-delay3 flex items-center gap-6 mt-10 justify-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> SSL Encrypted</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> No credit card needed</span>
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Used worldwide</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="lp-scroll-indicator">
          <div className="w-6 h-10 rounded-full border-2 border-primary/40 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-2.5 rounded-full bg-primary/60 lp-scroll-dot" />
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════
          SECTION 2 — PROBLEM + CAUSE
          ════════════════════════════════════════════ */}
      <section className="lp-section lp-problem">
        <div ref={problemRef} className="lp-reveal relative z-10 container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.2em] font-semibold text-red-400 mb-4">The Problem</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 max-w-3xl mx-auto leading-tight">
            You don't lack feedback.{" "}
            <span className="lp-gradient-text">You lack signal.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-14 max-w-2xl mx-auto">
            Every day, people see your idea and walk away with unanswered questions. They never tell you what those questions are.
          </p>

          {/* Floating questions grid */}
          <div
            ref={questionStaggerRef}
            className="lp-stagger flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto"
          >
            {floatingQuestions.map((q, i) => (
              <div
                key={q}
                className="lp-floating-question"
                style={{
                  "--dur": `${5 + (i % 4) * 1.5}s`,
                  "--delay": `${i * 0.3}s`,
                  "--float-y": `${-6 - (i % 3) * 4}px`,
                } as React.CSSProperties}
              >
                {q}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════
          SECTION 3 — SOLUTION LOOP
          ════════════════════════════════════════════ */}
      <section id="solution" className="lp-section lp-solution">
        <div ref={solutionRef} className="lp-reveal relative z-10 container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.2em] font-semibold text-primary mb-4">The Solution</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 max-w-3xl mx-auto leading-tight">
            Neesh AI turns scattered confusion into{" "}
            <span className="lp-gradient-text">clear direction.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
            A closed-loop system that validates your idea through real audience interaction.
          </p>

          {/* Solution Loop Flow */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 max-w-4xl mx-auto">
            {solutionSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-0">
                <div className="lp-loop-step">
                  <div className="lp-loop-icon">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground">{step.label}</span>
                  <span className="text-xs text-muted-foreground max-w-[120px]">{step.desc}</span>
                </div>
                {i < solutionSteps.length - 1 && (
                  <div className="hidden md:block lp-loop-connector mx-2" style={{ minWidth: "50px" }} />
                )}
                {i < solutionSteps.length - 1 && (
                  <div className="md:hidden w-0.5 h-8 bg-gradient-to-b from-primary/30 to-primary/10 my-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════
          SECTION 4 — PRODUCT SIMULATION
          ════════════════════════════════════════════ */}
      <section className="lp-section lp-simulation">
        <div ref={simulationRef} className="lp-reveal relative z-10 container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.2em] font-semibold text-primary mb-4">How It Feels</p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 max-w-3xl mx-auto leading-tight">
            Every question is a signal.{" "}
            <span className="lp-gradient-text">Every confusion is direction.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-14 max-w-2xl mx-auto">
            Watch how Neesh AI transforms raw visitor interactions into structured validation intelligence.
          </p>

          {/* Simulated product interface */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visitor Interactions */}
            <div className="lp-sim-card p-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-bold">Live Questions</span>
              </div>
              <div className="space-y-3">
                {["What problem does this solve?", "How is pricing structured?", "Can I try it first?"].map((q, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border border-border/30">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      i === 0 ? "bg-cyan-400 lp-signal-strong" : i === 1 ? "bg-cyan-400 lp-signal-soft" : "bg-red-400 lp-signal-critical"
                    }`} />
                    <span className="text-xs text-muted-foreground">{q}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Processing */}
            <div className="lp-sim-card p-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-indigo-500" />
                </div>
                <span className="text-sm font-bold">AI Clustering</span>
              </div>
              <div className="space-y-3">
                {[
                  { cluster: "Pricing Clarity", count: 12, severity: "high" },
                  { cluster: "Value Proposition", count: 8, severity: "medium" },
                  { cluster: "Trust Signals", count: 5, severity: "low" },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border/30">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        c.severity === "high" ? "bg-red-400" : c.severity === "medium" ? "bg-amber-400" : "bg-green-400"
                      }`} />
                      <span className="text-xs font-medium">{c.cluster}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gap Detection */}
            <div className="lp-sim-card p-6 text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                </div>
                <span className="text-sm font-bold">Gaps Found</span>
              </div>
              <div className="space-y-3">
                {[
                  "Missing pricing breakdown",
                  "No social proof visible",
                  "Unclear onboarding flow",
                ].map((gap, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200/50">
                    <Target className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-rose-700">{gap}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════
          SECTION 5 — CORE FEATURES
          ════════════════════════════════════════════ */}
      <section id="features" className="lp-section lp-features lp-section-short" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div ref={featuresRef} className="lp-reveal relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] font-semibold text-primary mb-4">Core Features</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 max-w-3xl mx-auto">
              Everything you need to{" "}
              <span className="lp-gradient-text">validate ideas.</span>
            </h2>
          </div>

          <div
            ref={featureStaggerRef}
            className="lp-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {coreFeatures.map((f) => (
              <div key={f.title} className="lp-feature-card">
                <div className={`lp-feature-icon bg-gradient-to-br ${f.gradient}`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════
          SECTION 6 — AI METRICS
          ════════════════════════════════════════════ */}
      <section className="lp-section lp-metrics lp-section-short" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div ref={metricsRef} className="lp-reveal relative z-10 container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.2em] font-semibold text-primary mb-4">The Numbers</p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            If you can't measure clarity, <span className="lp-gradient-text">you don't have it.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-14 max-w-xl mx-auto">
            Real-time intelligence you can act on.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {metrics.map((m) => (
              <StatCounter key={m.label} value={m.value} label={m.label} suffix={m.suffix} />
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════
          SECTION 7 — PERSONA INSIGHTS
          ════════════════════════════════════════════ */}
      <section id="personas" className="lp-section lp-personas lp-section-short" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div ref={personasRef} className="lp-reveal relative z-10 container mx-auto px-4 text-center">
          <p className="text-sm uppercase tracking-[0.2em] font-semibold text-primary mb-4">Audience Intelligence</p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            15 Distinct Personas. <span className="lp-gradient-text">15 Different Perspectives.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-14 max-w-2xl mx-auto">
            Each persona asks different questions. Each confusion pattern reveals a unique gap. Neesh AI detects them all.
          </p>

          <div
            ref={personaStaggerRef}
            className="lp-stagger grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-w-4xl mx-auto"
          >
            {personas.map((p) => (
              <div key={p.name} className="lp-persona-card">
                <div className="lp-persona-avatar bg-gradient-to-br from-primary/5 to-indigo-500/5 border border-primary/10">
                  <span>{p.emoji}</span>
                </div>
                <span className="text-xs font-semibold text-foreground">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════
          SECTION 8 — TRANSFORMATION
          ════════════════════════════════════════════ */}
      <section className="lp-section lp-transformation lp-section-short" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div ref={transformRef} className="lp-reveal relative z-10 container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.2em] font-semibold text-primary mb-4">The Shift</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
              From Assumptions → <span className="lp-gradient-text">Evidence.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* BEFORE */}
            <div className="lp-split-before">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <XIcon className="w-4 h-4 text-red-500" />
                </div>
                <h3 className="font-bold text-red-600 text-sm uppercase tracking-wider">Before Neesh AI</h3>
              </div>
              <div className="space-y-0">
                {beforeItems.map((item) => (
                  <div key={item} className="lp-chaos-item">
                    <XIcon className="w-3.5 h-3.5 text-red-300 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AFTER */}
            <div className="lp-split-after">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <Check className="w-4 h-4 text-cyan-600" />
                </div>
                <h3 className="font-bold text-cyan-700 text-sm uppercase tracking-wider">After Neesh AI</h3>
              </div>
              <div className="space-y-0">
                {afterItems.map((item) => (
                  <div key={item} className="lp-clarity-item">
                    <Check className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════
          SECTION 9 — PRICING
          ════════════════════════════════════════════ */}
      <section className="lp-section lp-pricing lp-section-short" style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <div ref={pricingRef} className="lp-reveal relative z-10 container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm uppercase tracking-[0.2em] font-semibold text-primary mb-4">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Simple, <span className="lp-gradient-text">transparent</span> pricing.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Start free. Upgrade when you're ready. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`lp-pricing-card ${plan.popular ? "popular md:scale-105 md:z-10" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#09daed] to-[#6366f1] text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg whitespace-nowrap">
                    ⚡ MOST POPULAR
                  </div>
                )}

                <div className="flex items-center gap-2 mb-1">
                  <plan.icon className={`w-5 h-5 ${plan.color}`} />
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{plan.label}</span>
                </div>

                <p className="text-xs text-muted-foreground mb-4">{plan.subtitle}</p>

                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground ml-1 text-sm">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((ft) => (
                    <li key={ft} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.popular ? "text-[#09daed]" : "text-primary"}`} />
                      {ft}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full h-11 font-semibold ${
                    plan.popular
                      ? "bg-gradient-to-r from-[#09daed] to-[#6366f1] hover:from-[#08c5d6] hover:to-[#5558e0] text-white shadow-lg shadow-[#09daed]/20"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link to={plan.name === "Enterprise" ? "/pricing" : "/pricing"}>
                    {plan.cta}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════════
          SECTION 10 — FINAL CTA
          ════════════════════════════════════════════ */}
      <section className="lp-section lp-final-cta">
        <div ref={finalCtaRef} className="lp-reveal relative z-10 container mx-auto px-4 text-center">
          {/* Decorative orbs */}
          <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full bg-[#09daed]/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-10 w-48 h-48 rounded-full bg-[#6366f1]/5 blur-3xl pointer-events-none" />

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight max-w-3xl mx-auto">
            Don't Build Another Feature Until{" "}
            <span className="lp-gradient-text">This Makes Sense.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Join thousands of founders who validate before they build. Start your first validation loop — it's free.
          </p>
          <Button
            size="lg"
            asChild
            className="group text-base h-14 px-12 shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all lp-cta-pulse"
          >
            <Link to="/signup">
              Start Your First Validation Loop
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>


      {/* ════════════════════════════════════════════
          SECTION 11 — FOOTER
          ════════════════════════════════════════════ */}
      <footer className="lp-footer py-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#09daed] to-[#6366f1] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="text-white font-bold text-lg">Neesh <span className="text-[#09daed]">AI</span></span>
              </div>
              <p className="text-sm leading-relaxed opacity-70">
                Validate ideas. Learn from your audience. Build what matters.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#features">Features</a></li>
                <li><Link to="/pricing">Pricing</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#">Docs</a></li>
                <li><a href="#">Blog</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#">Contact</a></li>
                <li><a href="#">About</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm opacity-50">
              © {new Date().getFullYear()} Neesh AI. All rights reserved.
            </p>
            <p className="text-sm font-medium text-[#09daed] tracking-wide">
              Clarity Before Code.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
