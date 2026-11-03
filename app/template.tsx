"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Page transition: a lavender curtain lifts while the new page rises in.
 * (template.tsx re-mounts on every navigation in the App Router.)
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] origin-top bg-violet"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[59] origin-top bg-butter"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1], delay: 0.08 }}
      />
      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}>
        {children}
      </motion.div>
    </>
  );
}
