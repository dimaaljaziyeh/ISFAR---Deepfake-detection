import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLang } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { api } from "@/services/api";
import { isSupported, type DetectionVerdict } from "@/lib/detection";
import { toast } from "sonner";
import {
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  History,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/detector")({
  component: DetectorPage,
});

type HistoryRow = {
  id: string;
  fileName: string;
  mediaType: "IMAGE" | "VIDEO";
  result: "REAL" | "FAKE";
  confidence: number;
  createdAt: string;
};

function DetectorPage() {
  const { t, lang } = useLang();
  const { user, loading: authLoading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [verdict, setVerdict] = useState<DetectionVerdict | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getDetections();
      setHistory(data.map((d: any) => ({
        id: d.id,
        fileName: d.fileName,
        mediaType: d.mediaType,
        result: d.result,
        confidence: d.confidence,
        createdAt: d.createdAt,
      })));
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }, [user]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFile(f: File) {
    if (!isSupported(f)) {
      toast.error("Unsupported file. Please upload JPG, JPEG, PNG, or WEBP.");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      toast.error("File too large. Max 50MB.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setVerdict(null);
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setVerdict(null);
  }

  async function runDetection() {
    if (!file || !user) return;

    setAnalyzing(true);

    try {
      const result = await api.uploadImage(file);

      setVerdict({
        result:
          result.result === "FAKE" ||
          result.predicted_class === "fake"
            ? "fake"
            : "real",

        confidence: Math.round(
          Number(result.confidence) * (Number(result.confidence) <= 1 ? 100 : 1)
        ),
      });

      void loadHistory();
    } catch (error: any) {
      console.error("Detection Error:", error);

      toast.error(
        error?.message ||
        "Detection failed"
      );
    } finally {
      setAnalyzing(false);
    }
  }

  const localeFmt = (d: string) =>
    new Date(d).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-soft">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{t.detector.title}</h1>
            <p className="mt-2 text-muted-foreground">{t.detector.subtitle}</p>
          </div>


          {!authLoading && !user && (
            <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
              <p className="text-muted-foreground">{t.detector.requireLogin}</p>
              <Link to="/login" className="inline-block mt-4">
                <Button className="bg-hero text-primary-foreground">{t.detector.goLogin}</Button>
              </Link>
            </div>
          )}

          {user && (
            <>
              {/* Upload zone */}
              {!file && (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files[0];
                    if (f) handleFile(f);
                  }}
                  className={`mt-8 rounded-3xl border-2 border-dashed p-12 text-center transition-all ${
                    dragOver
                      ? "border-primary bg-primary/5 shadow-glow scale-[1.01]"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-hero text-primary-foreground shadow-glow">
                    <Upload className="h-8 w-8" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold">{t.detector.drop}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.detector.formats}</p>
                  <div className="mt-5 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                    <span>{t.detector.or}</span>
                  </div>
                  <Button onClick={() => inputRef.current?.click()} variant="outline" className="mt-3">
                    {t.detector.browse}
                  </Button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                </div>
              )}

              {/* Preview + actions */}
              {file && (
                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <ImageIcon className="h-4 w-4" />
                        <span className="truncate max-w-[180px] sm:max-w-xs">{file.name}</span>
                      </div>
                      <Button size="sm" variant="ghost" onClick={reset} disabled={analyzing}>
                        <X className="h-4 w-4 me-1" /> {t.detector.remove}
                      </Button>
                    </div>
                    <div className="overflow-hidden rounded-xl bg-muted aspect-video grid place-items-center">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
                      ) : null}
                    </div>
                    <Button
                      onClick={runDetection}
                      disabled={analyzing}
                      size="lg"
                      className="mt-4 w-full bg-hero text-primary-foreground hover:opacity-95"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 me-2 animate-spin" /> {t.detector.analyzing}
                        </>
                      ) : (
                        t.detector.detect
                      )}
                    </Button>
                  </div>

                  {/* Result */}
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      {t.detector.result}
                    </h3>
                    {!verdict && !analyzing && (
                      <div className="mt-6 grid place-items-center text-center text-muted-foreground py-12">
                        <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
                          <Upload className="h-7 w-7 opacity-40" />
                        </div>
                        <p className="mt-3 text-sm">{t.detector.detect}</p>
                      </div>
                    )}
                    {analyzing && (
                      <div className="mt-6 grid place-items-center text-center py-12">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="mt-3 text-sm text-muted-foreground">{t.detector.analyzing}</p>
                      </div>
                    )}
                    {verdict && !analyzing && <VerdictCard verdict={verdict} />}
                  </div>
                </div>
              )}

              {/* History */}
              <div className="mt-12">
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-xl font-semibold">{t.detector.history}</h2>
                </div>
                {history.length === 0 ? (
                  <div className="rounded-2xl border border-border border-dashed bg-card/40 p-8 text-center text-sm text-muted-foreground">
                    {t.detector.noHistory}
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="text-start px-4 py-3">{t.admin.table.file}</th>
                          <th className="text-start px-4 py-3 hidden sm:table-cell">{t.admin.table.type}</th>
                          <th className="text-start px-4 py-3">{t.admin.table.result}</th>
                          <th className="text-start px-4 py-3">{t.admin.table.confidence}</th>
                          <th className="text-start px-4 py-3 hidden md:table-cell">{t.admin.table.date}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h) => (
                          <tr key={h.id} className="border-t border-border">
                            <td className="px-4 py-3 truncate max-w-[200px]">{h.fileName}</td>
                            <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">{h.mediaType}</td>
                            <td className="px-4 py-3">
                              <ResultBadge result={h.result.toLowerCase() as "real" | "fake"} />
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">{h.confidence}%</td>
                            <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{localeFmt(h.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function VerdictCard({ verdict }: { verdict: DetectionVerdict }) {
  const { t } = useLang();
  const isFake = verdict.result === "fake";
  return (
    <div className="mt-6">
      <div
        className={`rounded-2xl p-6 text-center shadow-soft ${
          isFake
            ? "bg-destructive/10 border border-destructive/30"
            : "bg-success/10 border border-success/30"
        }`}
      >
        <div
          className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${
            isFake ? "bg-destructive text-destructive-foreground" : "bg-success text-success-foreground"
          } shadow-glow`}
        >
          {isFake ? <AlertTriangle className="h-8 w-8" /> : <CheckCircle2 className="h-8 w-8" />}
        </div>
        <div className={`mt-4 font-display text-3xl font-extrabold ${isFake ? "text-destructive" : "text-success"}`}>
          {isFake ? t.detector.fake : t.detector.real}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{isFake ? t.detector.fakeDesc : t.detector.realDesc}</p>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-muted-foreground">{t.detector.confidence}</span>
          <span className="font-mono">{verdict.confidence}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all ${isFake ? "bg-destructive" : "bg-success"}`}
            style={{ width: `${verdict.confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function ResultBadge({ result }: { result: "real" | "fake" }) {
  const { t } = useLang();
  const isFake = result === "fake";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isFake
          ? "bg-destructive/15 text-destructive"
          : "bg-success/15 text-success"
      }`}
    >
      {isFake ? t.detector.fake : t.detector.real}
    </span>
  );
}
