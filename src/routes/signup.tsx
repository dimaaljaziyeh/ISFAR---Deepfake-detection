import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/detector" });
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.signup(email, password);
      toast.success(t.auth.signupSuccess);
      navigate({ to: "/login" });
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 grid place-items-center bg-soft px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elevated">
          <div className="mb-6 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-hero text-primary-foreground shadow-glow">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold">{t.auth.signupTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.auth.signupSubtitle}</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-hero text-primary-foreground hover:opacity-95">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.auth.signUp}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t.auth.haveAccount}{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
