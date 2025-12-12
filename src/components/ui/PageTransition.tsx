import { type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";

type PageTransitionProps = {
  children: ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
        className="min-h-screen w-full bg-slate-950 text-slate-100"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
