import { useState } from "react";
import { useI18n } from "../../lib/i18n";
import { motion, AnimatePresence } from "motion/react";

const LANG_OPTIONS: { code: "en" | "fr" | "es"; labelKey: string }[] = [
  { code: "en", labelKey: "lang.en" },
  { code: "fr", labelKey: "lang.fr" },
  { code: "es", labelKey: "lang.es" },
];

export function LanguageSelector() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);

  const current = LANG_OPTIONS.find((l) => l.code === lang)!;

  return (
    <div className="relative inline-block text-xs">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 border border-slate-700/70 px-3 py-1 text-slate-100 shadow-sm backdrop-blur hover:border-slate-500/80 hover:bg-slate-800/90 transition-colors"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        <span className="uppercase tracking-wide text-[0.7rem]">
          {current.code}
        </span>
        <span className="hidden sm:inline text-slate-300">
          {t(current.labelKey)}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 mt-2 w-40 rounded-2xl border border-slate-700/70 bg-slate-900/95 shadow-xl backdrop-blur p-1 z-20"
          >
            {LANG_OPTIONS.map((option) => (
              <li key={option.code}>
                <button
                  type="button"
                  onClick={() => {
                    setLang(option.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs ${
                    option.code === lang
                      ? "bg-slate-800 text-slate-50"
                      : "text-slate-200 hover:bg-slate-800/80"
                  }`}
                >
                  <span className="uppercase tracking-wide">{option.code}</span>
                  <span className="text-[0.7rem] text-slate-300">
                    {t(option.labelKey)}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
