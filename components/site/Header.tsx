"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, ArrowUpRight } from "lucide-react";

const NAV = [
  { href: "/kit", label: "Il Kit" },
  { href: "/come-funziona", label: "Come funziona" },
  { href: "/crea", label: "Crea" },
  { href: "/faq", label: "FAQ" },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group flex items-center gap-2.5 font-extrabold tracking-tight ${className}`} aria-label="MiniMe Studio — Home">
      <span className="relative grid size-9 place-items-center rounded-full bg-ink text-cream transition-transform duration-500 ease-out-expo group-hover:rotate-[20deg]">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
          <circle cx="12" cy="9.5" r="6" fill="currentColor" />
          <rect x="8" y="14" width="8" height="7" rx="3" fill="currentColor" />
          <circle cx="9.8" cy="9.6" r="1" fill="#242424" />
          <circle cx="14.2" cy="9.6" r="1" fill="#242424" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-butter ring-2 ring-cream" />
      </span>
      <span className="text-[17px]">
        MiniMe<span className="font-medium text-ink-soft"> Studio</span>
      </span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8 md:pt-5">
      <div
        className={`mx-auto flex h-14 max-w-[1440px] items-center justify-between rounded-full pl-3 pr-2 transition-all duration-500 ease-out-expo ${
          scrolled ? "bg-cream/75 shadow-[0_10px_40px_-20px_rgba(36,36,36,0.35)] ring-1 ring-ink/5 backdrop-blur-xl" : ""
        }`}
      >
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigazione principale">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`relative rounded-full px-4 py-2 text-[14px] font-semibold transition-colors ${active ? "text-ink" : "text-ink/60 hover:text-ink"}`}
              >
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-ink/5" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className="relative">{n.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/crea"
            className="group hidden h-10 items-center gap-2 rounded-full bg-ink pl-5 pr-1.5 text-[14px] font-semibold text-cream transition-colors hover:bg-violet-deep sm:inline-flex"
          >
            Crea la tua MiniMe
            <span className="grid size-7 place-items-center rounded-full bg-white/15 transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid size-10 place-items-center rounded-full bg-white ring-1 ring-ink/10 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Chiudi menu" : "Apri menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mt-3 max-w-[1440px] overflow-hidden rounded-[28px] bg-white p-3 shadow-xl ring-1 ring-ink/5 md:hidden"
            aria-label="Menu mobile"
          >
            {[{ href: "/", label: "Home" }, ...NAV].map((n, i) => (
              <motion.div key={n.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                <Link href={n.href} className="flex items-center justify-between rounded-2xl px-4 py-4 text-2xl font-bold tracking-tight hover:bg-cream">
                  {n.label}
                  <ArrowUpRight className="size-5 text-violet" />
                </Link>
              </motion.div>
            ))}
            <Link href="/crea" className="mt-2 flex h-14 items-center justify-center rounded-2xl bg-ink font-semibold text-cream">
              Crea la tua MiniMe
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
