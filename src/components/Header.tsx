import { Link, useNavigate } from "@tanstack/react-router";
import { Moon, Sun, Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";
import { useLang } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import logo from "@/assets/logo.png";

export function Header() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { t, toggle: toggleLang, lang } = useLang();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { to: "/", label: t.nav.home },
    { to: "/#how", label: t.nav.howItWorks },
    { to: "/#features", label: t.nav.features },
    { to: "/#services", label: t.nav.services },
    { to: "/#contact", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <img src={logo} alt="Logo" className="h-9 w-9" />
          <span>{t.brand}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLang}
            aria-label="Switch language"
            title={t.common.switchLang}
            className="hidden sm:inline-flex"
          >
            <Globe className="h-4 w-4" />
            <span className="ms-1 text-xs font-semibold uppercase">{lang === "en" ? "AR" : "EN"}</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="hidden sm:inline-flex">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <Link to="/detector" className="hidden sm:block">
            <Button variant="default" className="bg-hero text-primary-foreground shadow-soft hover:opacity-95">
              {t.nav.detector}
            </Button>
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    {t.nav.admin}
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut().then(() => navigate({ to: "/" }))}>
                {t.nav.logout}
              </Button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button variant="ghost" size="sm">
                {t.nav.login}
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((l) => (
              <a
                key={l.to}
                href={l.to}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {l.label}
              </a>
            ))}
            <Link to="/detector" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm font-semibold text-primary">
              {t.nav.detector}
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm">
                    {t.nav.admin}
                  </Link>
                )}
                <button
                  onClick={() => {
                    setOpen(false);
                    void signOut().then(() => navigate({ to: "/" }));
                  }}
                  className="block w-full text-start rounded-md px-3 py-2 text-sm"
                >
                  {t.nav.logout}
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2 text-sm">
                {t.nav.login}
              </Link>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={toggleLang} className="flex-1">
                <Globe className="h-4 w-4 me-1" /> {t.common.switchLang}
              </Button>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="flex-1">
                {theme === "light" ? <Moon className="h-4 w-4 me-1" /> : <Sun className="h-4 w-4 me-1" />}
                {theme === "light" ? t.common.darkMode : t.common.lightMode}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
