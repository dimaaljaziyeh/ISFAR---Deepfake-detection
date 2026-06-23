import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Trash2, Search, ShieldAlert, Activity, AlertTriangle, CheckCircle2, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Row = {
  id: string;
  fileName: string;
  mediaType: "IMAGE" | "VIDEO";
  result: "REAL" | "FAKE";
  confidence: number;
  createdAt: string;
};

function AdminPage() {
  const { t, lang } = useLang();
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"all" | "real" | "fake">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  const load = async () => {
    try {
      const data = await api.getDetections();
      setRows(data.map((d: any) => ({
        id: d.id,
        fileName: d.fileName,
        mediaType: d.mediaType,
        result: d.result,
        confidence: d.confidence,
        createdAt: d.createdAt,
      })));
    } catch (error) {
      console.error("Failed to load detections:", error);
    }
  };

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const resultLower = r.result.toLowerCase() as "real" | "fake";
      if (filter !== "all" && resultLower !== filter) return false;
      if (search && !r.fileName.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rows, filter, search]);

  const stats = useMemo(() => {
    const total = rows.length;
    const fake = rows.filter((r) => r.result === "FAKE").length;
    const real = total - fake;
    const fakeRate = total ? Math.round((fake / total) * 100) : 0;
    return { total, fake, real, fakeRate };
  }, [rows]);

  const onDelete = async (id: string) => {
    try {
      await api.deleteDetection(id);
      setRows((r) => r.filter((x) => x.id !== id));
      toast.success(t.admin.deleted);
    } catch (error) {
      toast.error("Failed to delete detection");
    }
  };

  const localeFmt = (d: string) =>
    new Date(d).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  if (loading) return null;

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 grid place-items-center bg-soft px-4 py-16">
          <div className="max-w-md text-center rounded-2xl border border-border bg-card p-8 shadow-soft">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h1 className="mt-4 font-display text-xl font-bold">{t.admin.notAdmin}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t.admin.grantHint}</p>
            <Link to="/" className="inline-block mt-5">
              <Button variant="outline">{t.nav.home}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-soft">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div>
            <h1 className="font-display text-3xl font-bold">{t.admin.title}</h1>
            <p className="mt-1 text-muted-foreground">{t.admin.subtitle}</p>
          </div>

          {/* Stats */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Activity} label={t.admin.total} value={stats.total} tone="primary" />
            <StatCard icon={AlertTriangle} label={t.admin.fakeCount} value={stats.fake} tone="destructive" />
            <StatCard icon={CheckCircle2} label={t.admin.realCount} value={stats.real} tone="success" />
            <StatCard icon={BarChart3} label={t.admin.fakeRate} value={`${stats.fakeRate}%`} tone="primary" />
          </div>

          {/* Filters */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.admin.search}
                className="ps-10"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "real", "fake"] as const).map((k) => (
                <Button
                  key={k}
                  variant={filter === k ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(k)}
                  className={filter === k ? "bg-hero text-primary-foreground" : ""}
                >
                  {k === "all" ? t.admin.filterAll : k === "real" ? t.admin.filterReal : t.admin.filterFake}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-start px-4 py-3">{t.admin.table.file}</th>
                    <th className="text-start px-4 py-3">{t.admin.table.type}</th>
                    <th className="text-start px-4 py-3">{t.admin.table.result}</th>
                    <th className="text-start px-4 py-3">{t.admin.table.confidence}</th>
                    <th className="text-start px-4 py-3">{t.admin.table.date}</th>
                    <th className="text-end px-4 py-3">{t.admin.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        {t.admin.empty}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium truncate max-w-xs">{r.fileName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{r.mediaType}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              r.result === "FAKE"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-success/15 text-success"
                            }`}
                          >
                            {r.result === "FAKE" ? t.detector.fake : t.detector.real}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{r.confidence}%</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{localeFmt(r.createdAt)}</td>
                        <td className="px-4 py-3 text-end">
                          <Button size="sm" variant="ghost" onClick={() => onDelete(r.id)} className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  tone: "primary" | "destructive" | "success";
}) {
  const toneClasses =
    tone === "destructive"
      ? "bg-destructive/10 text-destructive"
      : tone === "success"
      ? "bg-success/10 text-success"
      : "bg-primary/10 text-primary";
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${toneClasses}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 font-display text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
