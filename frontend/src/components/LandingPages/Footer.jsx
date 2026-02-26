import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-slate-100 dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 py-16 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                            <span className="text-2xl">⚡</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">{t('brandName')}</span>
                        </Link>
                        <p className="text-sm opacity-70 leading-relaxed">
                            {t('civicTagline')}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6">{t('platform')}</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/how-it-works" className="hover:text-blue-400 transition-colors">{t('howItWorks')}</Link></li>
                            <li><a href="/#features" className="hover:text-blue-400 transition-colors">{t('features')}</a></li>
                            <li><Link to="/municipalities" className="hover:text-blue-400 transition-colors">{t('forMunicipalities')}</Link></li>
                            <li><Link to="/success-stories" className="hover:text-blue-400 transition-colors">{t('successStories')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6">{t('company')}</h4>
                        <ul className="space-y-4 text-sm">
                            <li><a href="/#about" className="hover:text-blue-400 transition-colors">{t('aboutUs')}</a></li>
                            <li><Link to="/privacy-policy" className="hover:text-blue-400 transition-colors">{t('privacyPolicy')}</Link></li>
                            <li><Link to="/terms-of-service" className="hover:text-blue-400 transition-colors">{t('termsOfService')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-slate-900 dark:text-white font-bold mb-6">{t('connect')}</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-white flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                                {/* Twitter icon substitute */}
                                <span className="font-bold">X</span>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-white flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                                {/* LinkedIn icon substitute */}
                                <span className="font-bold">in</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs opacity-70 dark:opacity-60">
                    <p>{t('rightsReserved')}</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <span>{t('madeWithIndia')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
