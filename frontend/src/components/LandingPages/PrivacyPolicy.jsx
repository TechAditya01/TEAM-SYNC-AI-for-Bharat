import React from 'react';
import { useLanguage } from '../../context/LanguageContext';


export default function PrivacyPolicy() {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-300">

            <main className="flex-grow py-16 px-6 max-w-3xl mx-auto w-full">
                <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">{t('privacyPolicy')}</h1>
                <div className="prose prose-slate dark:prose-invert hover:prose-a:text-blue-600">
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{t('privacyLastUpdated')}</p>

                    <h2 className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">{t('privacySection1Title')}</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{t('privacySection1Text')}</p>

                    <h2 className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">{t('privacySection2Title')}</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{t('privacySection2Intro')}</p>
                    <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 space-y-2 mb-4">
                        <li>{t('privacyPoint1')}</li>
                        <li>{t('privacyPoint2')}</li>
                        <li>{t('privacyPoint3')}</li>
                        <li>{t('privacyPoint4')}</li>
                    </ul>

                    <h2 className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-white">{t('privacySection3Title')}</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{t('privacySection3Text')}</p>
                </div>
            </main>

        </div>
    );
}
