import { ShieldCheck } from "lucide-react";
import { useLang } from "@/providers/LanguageProvider";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-24 border-t border-border bg-soft">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display font-bold text-lg">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-hero text-primary-foreground">
                <ShieldCheck className="h-4 w-4" />
              </span>
              {t.brand}
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">{t.footer.tagline}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">{t.footer.product}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="/detector" className="hover:text-foreground">{t.nav.detector}</a></li>
              <li><a href="/#features" className="hover:text-foreground">{t.nav.features}</a></li>
              <li><a href="/#how" className="hover:text-foreground">{t.nav.howItWorks}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">{t.footer.company}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="/#about" className="hover:text-foreground">{t.nav.about}</a></li>
              <li><a href="/#services" className="hover:text-foreground">{t.nav.services}</a></li>
              <li><a href="/#contact" className="hover:text-foreground">{t.nav.contact}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">{t.footer.legal}</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {t.brand}. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
