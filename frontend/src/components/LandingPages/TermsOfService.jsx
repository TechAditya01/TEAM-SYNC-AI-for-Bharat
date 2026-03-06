import React from "react";
import { FileText, AlertTriangle, Scale } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function TermsOfService() {
const { t } = useLanguage();

return ( <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">

```
  <div className="max-w-5xl mx-auto px-6 py-16">

    {/* Header */}
    <div className="text-center mb-14">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
        {t("termsOfService")}
      </h1>

      <p className="text-gray-600 dark:text-gray-400">
        {t("termsWelcome")}
      </p>
    </div>

    {/* Section 1 */}
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-8">

      <div className="flex items-center gap-4 mb-4">
        <FileText className="text-blue-600" size={32} />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("termsSection1Title")}
        </h2>
      </div>

      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {t("termsSection1Text")}
      </p>

    </div>

    {/* Section 2 */}
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-8">

      <div className="flex items-center gap-4 mb-4">
        <AlertTriangle className="text-orange-500" size={32} />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("termsSection2Title")}
        </h2>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {t("termsSection2Intro")}
      </p>

      <ul className="space-y-3 text-gray-600 dark:text-gray-400">
        <li>• {t("termsPoint1")}</li>
        <li>• {t("termsPoint2")}</li>
        <li>• {t("termsPoint3")}</li>
      </ul>

    </div>

    {/* Final Section */}
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">

      <div className="flex items-center gap-4 mb-4">
        <Scale className="text-purple-600" size={32} />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Legal Agreement
        </h2>
      </div>

      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {t("termsFinalText")}
      </p>

    </div>

  </div>

</div>

);
}
