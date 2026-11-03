"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

type BtnProps = {
  href: string;
  children: ReactNode;
  variant?: "dark" | "light" | "ghost" | "violet";
  size?: "md" | "lg";
  className?: string;
  icon?: boolean;
};

const variants = {
  dark: "bg-ink text-cream hover:bg-violet-deep",
  light: "bg-white text-ink hover:bg-butter",
  violet: "bg-violet text-white hover:bg-violet-deep",
  ghost: "bg-transparent text-ink ring-1 ring-ink/15 hover:ring-ink/40 hover:bg-white/60",
};

export function Button({ href, children, variant = "dark", size = "md", className = "", icon = true }: BtnProps) {
  const sizes = size === "lg" ? "h-16 pl-8 pr-3 text-lg gap-5" : "h-12 pl-6 pr-2 text-[15px] gap-3";
  const dot = size === "lg" ? "size-11" : "size-8";
  return (
    <Link
      href={href}
      className={`group inline-flex items-center rounded-full font-semibold tracking-tight transition-colors duration-300 ${sizes} ${variants[variant]} ${icon ? "" : "pr-6"} ${className}`}
    >
      <span>{children}</span>
      {icon && (
        <span
          className={`${dot} grid place-items-center rounded-full transition-transform duration-500 ease-out-expo group-hover:rotate-45 ${
            variant === "dark" || variant === "violet" ? "bg-white/15" : "bg-ink/5"
          }`}
        >
          <ArrowUpRight className="size-4" strokeWidth={2.4} />
        </span>
      )}
    </Link>
  );
}

/** Masked word-by-word reveal for editorial headlines. */
export function RevealText({
  text,
  className = "",
  delay = 0,
  play = true,
  as: Tag = "span",
  stagger = 0.06,
}: {
  text: string;
  className?: string;
  delay?: number;
  play?: boolean;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  const lines = text.split("\n");
  let i = 0;
  return (
    <Tag className={className} aria-label={text.replace(/\n/g, " ")}>
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {line.split(" ").map((word, wi) => {
            const idx = i++;
            return (
              <span key={wi} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] align-bottom">
                <motion.span
                  className="inline-block will-change-transform"
                  initial={reduce ? false : { y: "110%", rotate: 4 }}
                  animate={play ? { y: "0%", rotate: 0 } : undefined}
                  transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: delay + idx * stagger }}
                >
                  {word}
                  {wi < line.split(" ").length - 1 ? " " : ""}
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}

/** Fade-up on enter viewport. */
export function FadeIn({ children, className = "", delay = 0, y = 28 }: { children: ReactNode; className?: string; delay?: number; y?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-eyebrow flex items-center gap-3 ${className}`}>
      <span className="inline-block size-1.5 rounded-full bg-violet" />
      {children}
    </p>
  );
}
