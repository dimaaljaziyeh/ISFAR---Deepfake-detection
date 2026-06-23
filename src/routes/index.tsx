import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Upload,
  Cpu,
  ShieldCheck,
  Sparkles,
  Eye,
  Lock,
  FileVideo,
  Newspaper,
  Globe2,
  Building2,
  ArrowRight,
  Mail,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLang } from "@/providers/LanguageProvider";
import { api } from "@/services/api";
import { toast } from "sonner";
import { z } from "zod";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  message: z.string().trim().min(1).max(2000),
});

function Index() {
  const { t } = useLang();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <About />
        <Services />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden bg-soft">
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute -top-32 -end-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -start-32 h-96 w-96 rounded-full bg-accent/40 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 py-20 md:py-28 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {t.hero.badge}
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {t.hero.title}
            <br />
            <span className="text-gradient">{t.hero.titleAccent}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">{t.hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/detector">
              <Button size="lg" className="bg-hero text-primary-foreground shadow-glow hover:opacity-95 animate-pulse-glow">
                {t.hero.ctaPrimary}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
            <a href="#how">
              <Button size="lg" variant="outline">
                {t.hero.ctaSecondary}
              </Button>
            </a>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg">
            {[
              { v: t.hero.stat1, l: t.hero.stat1Label },
              { v: t.hero.stat2, l: t.hero.stat2Label },
              { v: t.hero.stat3, l: t.hero.stat3Label },
            ].map((s, i) => (
              <div key={i}>
                <div className="font-display text-2xl font-bold text-foreground">{s.v}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-hero rounded-3xl blur-2xl opacity-30 animate-float" />
          <img
            src={heroImg}
            alt="Deepfake detection visualization showing a face split between authentic and AI-generated halves"
            width={1600}
            height={1024}
            className="relative rounded-3xl shadow-elevated ring-1 ring-border/40"
          />
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="text-sm font-semibold uppercase tracking-wider text-primary">{eyebrow}</span>
      <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function HowItWorks() {
  const { t } = useLang();
  const steps = [
    { icon: Upload, title: t.how.step1Title, desc: t.how.step1Desc },
    { icon: Cpu, title: t.how.step2Title, desc: t.how.step2Desc },
    { icon: ShieldCheck, title: t.how.step3Title, desc: t.how.step3Desc },
  ];
  return (
    <section id="how" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader eyebrow={t.how.eyebrow} title={t.how.title} subtitle={t.how.subtitle} />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-border bg-card-gradient p-8 shadow-soft transition-all hover:shadow-elevated hover:-translate-y-1"
            >
              <div className="absolute top-6 end-6 font-display text-5xl font-bold text-muted/40">0{i + 1}</div>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const { t } = useLang();
  const items = [
    { icon: ShieldCheck, title: t.features.f1Title, desc: t.features.f1Desc },
    { icon: FileVideo, title: t.features.f2Title, desc: t.features.f2Desc },
    { icon: Eye, title: t.features.f3Title, desc: t.features.f3Desc },
    { icon: Lock, title: t.features.f4Title, desc: t.features.f4Desc },
  ];
  return (
    <section id="features" className="bg-soft py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader eyebrow={t.features.eyebrow} title={t.features.title} />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-hero text-primary-foreground shadow-glow">
                <it.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  const { t } = useLang();
  return (
    <section id="about" className="py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t.about.eyebrow}</span>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t.about.title}</h2>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{t.about.body}</p>
      </div>
    </section>
  );
}

function Services() {
  const { t } = useLang();
  const items = [
    { icon: Newspaper, title: t.services.s1Title, desc: t.services.s1Desc },
    { icon: Globe2, title: t.services.s2Title, desc: t.services.s2Desc },
    { icon: Building2, title: t.services.s3Title, desc: t.services.s3Desc },
  ];
  return (
    <section id="services" className="bg-soft py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader eyebrow={t.services.eyebrow} title={t.services.title} />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-soft transition-all hover:shadow-elevated">
              <div className="absolute -end-8 -top-8 h-32 w-32 rounded-full bg-primary/5 transition-transform group-hover:scale-125" />
              <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <it.icon className="h-6 w-6" />
              </span>
              <h3 className="relative mt-5 font-display text-xl font-semibold">{it.title}</h3>
              <p className="relative mt-2 text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const { t } = useLang();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? t.contact.error);
      return;
    }
    setSubmitting(true);
    try {
      await api.submitContact(parsed.data);
      toast.success(t.contact.sent);
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      toast.error(t.contact.error);
    }
    setSubmitting(false);
  }

  return (
    <section id="contact" className="py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">{t.contact.eyebrow}</span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t.contact.title}</h2>
          <p className="mt-4 text-muted-foreground">{t.contact.subtitle}</p>
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </span>
            <div className="text-sm">
              <div className="font-semibold">hello@isfar.ai</div>
              <div className="text-muted-foreground">Mon–Fri · 9am–6pm</div>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-soft space-y-4">
          <div>
            <Label htmlFor="name">{t.contact.name}</Label>
            <Input
              id="name"
              value={form.name}
              maxLength={100}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="email">{t.contact.email}</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              maxLength={255}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="message">{t.contact.message}</Label>
            <Textarea
              id="message"
              rows={5}
              value={form.message}
              maxLength={2000}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              className="mt-1.5"
            />
          </div>
          <Button type="submit" size="lg" disabled={submitting} className="w-full bg-hero text-primary-foreground hover:opacity-95">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t.contact.send}
          </Button>
        </form>
      </div>
    </section>
  );
}
