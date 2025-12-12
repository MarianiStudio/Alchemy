import { useI18n } from '../../lib/i18n';
import { ExternalLink, Mail } from 'lucide-react';

export function Footer() {
    const { t } = useI18n();

    return (
        <footer className="w-full py-6 px-4 mt-auto border-t border-slate-800/50">
            <div className="max-w-4xl mx-auto">
                {/* Privacy Tagline */}
                <p className="text-center text-sm text-slate-400 mb-4">
                    {t('footer.tagline')}
                </p>

                {/* Links Row */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
                    <a
                        href="https://irreductia.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-amber-400 transition-colors"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Irreductia
                    </a>

                    <span className="hidden sm:inline text-slate-700">•</span>

                    <a
                        href="mailto:hello@irreductia.com"
                        className="flex items-center gap-1 hover:text-amber-400 transition-colors"
                    >
                        <Mail className="w-3 h-3" />
                        {t('footer.feedback')}
                    </a>

                    <span className="hidden sm:inline text-slate-700">•</span>

                    <span className="text-slate-600">
                        {t('footer.powered')}{' '}
                        <a
                            href="https://marianistudio.fr"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400/80 hover:text-amber-400 transition-colors"
                        >
                            Mariani Studio
                        </a>
                    </span>
                </div>
            </div>
        </footer>
    );
}
