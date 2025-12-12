import { motion } from 'motion/react';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/ui/PageTransition';
import { useI18n } from '../lib/i18n';

function NotFoundPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative mb-8"
        >
          <span className="text-[120px] sm:text-[180px] font-bold text-slate-800 select-none">
            404
          </span>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Compass className="w-16 h-16 sm:w-24 sm:h-24 text-amber-400 animate-pulse" />
          </motion.div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">
            {t('notfound.title')}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-md">
            {t('notfound.text')}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('notfound.back')}
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-900 text-sm font-semibold transition-all shadow-lg shadow-amber-500/20"
          >
            <Home className="w-4 h-4" />
            {t('notfound.home')}
          </button>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        </div>
      </div>
    </PageTransition>
  );
}

export default NotFoundPage;
