import React from "react";
import { Shield, Database, Lock } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function PrivacyPolicy() {
const { t } = useLanguage();

return ( <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">

```
  <div className="max-w-5xl mx-auto px-6 py-16">

    {/* Header */}
    <div className="text-center mb-14">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
        {t("privacyPolicy")}
      </h1>

      <p className="text-gray-600 dark:text-gray-400">
        {t("privacyLastUpdated")}
      </p>
    </div>

    {/* Section 1 */}
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-8">

      <div className="flex items-center gap-4 mb-4">
        <Shield className="text-blue-600" size={32} />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("privacySection1Title")}
        </h2>
      </div>

      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {t("privacySection1Text")}
      </p>
    </div>

    {/* Section 2 */}
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 mb-8">

      <div className="flex items-center gap-4 mb-4">
        <Database className="text-green-600" size={32} />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("privacySection2Title")}
        </h2>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {t("privacySection2Intro")}
      </p>

      <ul className="space-y-3 text-gray-600 dark:text-gray-400">
        <li>• {t("privacyPoint1")}</li>
        <li>• {t("privacyPoint2")}</li>
        <li>• {t("privacyPoint3")}</li>
        <li>• {t("privacyPoint4")}</li>
      </ul>

    </div>

    {/* Section 3 */}
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">

      <div className="flex items-center gap-4 mb-4">
        <Lock className="text-purple-600" size={32} />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("privacySection3Title")}
        </h2>
      </div>

      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {t("privacySection3Text")}
      </p>

    </div>

  </div>

</div>

);
}
