import React from 'react';
import { useLanguage } from '../../context/LanguageContext';


export default function TermsOfService() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-300">

            <main className="flex-grow py-16 px-6 max-w-3xl mx-auto w-full">
                <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">{t('termsOfService')}</h1>
                <div className="prose prose-slate dark:prose-invert">
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{t('termsWelcome')}</p>

                    <h2 className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">{t('termsSection1Title')}</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{t('termsSection1Text')}</p>

                    <h2 className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">{t('termsSection2Title')}</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{t('termsSection2Intro')}</p>
                    <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 space-y-2 mb-4">
                        <li>{t('termsPoint1')}</li>
                        <li>{t('termsPoint2')}</li>
                        <li>{t('termsPoint3')}</li>
                    </ul>

                    <p className="text-slate-600 dark:text-slate-400 mb-4">{t('termsFinalText')}</p>
                </div>
            </main>

        </div>
    );
}
