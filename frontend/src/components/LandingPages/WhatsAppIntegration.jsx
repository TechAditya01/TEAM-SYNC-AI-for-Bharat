import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { MessageCircle, Camera, MapPin, Check, Send, Download } from 'lucide-react';

export default function WhatsAppIntegration() {
    const { t } = useLanguage();
    const [downloading, setDownloading] = useState(false);

    // Get WhatsApp bot number from environment variable
    const WHATSAPP_NUMBER = import.meta.env.VITE_GREEN_API_PHONE || "918872825483";
    const DEMO_MESSAGE = import.meta.env.VITE_WHATSAPP_DEMO_MESSAGE || "Hi, I want to try reporting a civic issue";
    
    const openWhatsAppChat = () => {
        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEMO_MESSAGE)}`;
        window.open(url, '_blank');
    };

    const downloadTestImage = () => {
        setDownloading(true);
        // Download the test image from public folder
        const link = document.createElement('a');
        link.href = '/3.jpeg'; // Using the garbage/civic issue image
        link.download = 'test-civic-issue.jpeg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => setDownloading(false), 1000);
    };

    return (
        <section
            id="whatsapp"
            className="relative py-24 bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden"
        >
            {/* Soft background glow */}
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-green-300/20 dark:bg-green-900/20 rounded-full blur-3xl"></div>

            <div className="relative max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* LEFT CONTENT */}
                    <div>
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold">
                            💬 {t('whatsappBadge')}
                        </div>

                        {/* Heading */}
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
                            {t('whatsappHeadingLine1')}
                            <br />
                            <span className="text-green-600 dark:text-green-400">
                                {t('whatsappHeadingLine2')}
                            </span>
                        </h2>

                        {/* Subtext */}
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mb-10">
                            {t('whatsappSubtext')}
                        </p>

                        {/* Visual Feature List */}
                        <div className="grid sm:grid-cols-2 gap-5 mb-12">
                            {[
                                {
                                    emoji: "📱",
                                    title: t('whatsappPoint1Title'),
                                    desc: t('whatsappPoint1Desc')
                                },
                                {
                                    emoji: "📍",
                                    title: t('whatsappPoint2Title'),
                                    desc: t('whatsappPoint2Desc')
                                },
                                {
                                    emoji: "🧠",
                                    title: t('whatsappPoint3Title'),
                                    desc: t('whatsappPoint3Desc')
                                },
                                {
                                    emoji: "🔔",
                                    title: t('whatsappPoint4Title'),
                                    desc: t('whatsappPoint4Desc')
                                }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
                                >
                                    <div className="text-2xl">{item.emoji}</div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4 mb-8">
                            <button
                                onClick={openWhatsAppChat}
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold shadow-xl hover:scale-105 transition-all"
                            >
                                <MessageCircle size={24} />
                                {t('whatsappCta') || 'Try Demo on WhatsApp'}
                            </button>
                            
                            <button
                                onClick={downloadTestImage}
                                disabled={downloading}
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-2 border-green-500 hover:bg-green-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                            >
                                <Download size={20} />
                                {downloading ? 'Downloading...' : 'Download Test Image'}
                            </button>
                        </div>

                        {/* Bot Status Badge */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-bold flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                Bot Online • +{WHATSAPP_NUMBER}
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <StepItem icon={<Send size={18} />} label="1. Say Hi" />
                            <StepItem icon={<Camera size={18} />} label="2. Send Photo" />
                            <StepItem icon={<MapPin size={18} />} label="3. Share Location" />
                            <StepItem icon={<Check size={18} />} label="4. Get Ticket" />
                        </div>

                        {/* Instructions */}
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-900 dark:text-blue-300 font-semibold mb-3 flex items-center gap-2">
                                🎯 How to test the bot:
                            </p>
                            <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-2 list-decimal list-inside">
                                <li>Click <strong>"Try Demo on WhatsApp"</strong> to open chat with bot</li>
                                <li>Click <strong>"Download Test Image"</strong> to get a civic issue photo</li>
                                <li>Send the downloaded image to the bot on WhatsApp</li>
                                <li>Bot will analyze with AI and ask for your location</li>
                                <li>Share your location to complete the report</li>
                                <li>Receive confirmation with ticket ID</li>
                            </ol>
                        </div>
                    </div>

                    {/* RIGHT PHONE MOCKUP */}
                    <div className="relative flex justify-center">
                        <div className="absolute inset-0 bg-gradient-to-tr from-green-200/40 to-blue-200/40 blur-3xl rounded-full"></div>

                        <div className="relative w-[300px] h-[600px] rounded-[2.5rem] border-[14px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="absolute top-0 left-0 right-0 h-16 bg-[#075E54] flex items-center px-4 text-white z-10">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs">
                                    NH
                                </div>
                                <div className="ml-3">
                                    <div className="text-sm font-semibold">
                                        {t('whatsappChatAgent')}
                                    </div>
                                    <div className="text-[10px] opacity-80">
                                        {t('whatsappChatStatus')}
                                    </div>
                                </div>
                            </div>

                            {/* Chat */}
                            <div className="pt-20 px-4 space-y-4 text-[13px] bg-[#ECE5DD] h-full">
                                <div className="max-w-[85%] bg-white p-3 rounded-lg shadow">
                                    {t('whatsappChatLine1')}
                                    <div className="text-[10px] text-right text-gray-400 mt-1">
                                        10:00 AM
                                    </div>
                                </div>

                                <div className="ml-auto max-w-[85%] bg-[#DCF8C6] p-3 rounded-lg shadow">
                                    {t('whatsappChatLine2')}
                                    <div className="text-[10px] text-right text-gray-500 mt-1">
                                        10:01 AM
                                    </div>
                                </div>

                                <div className="max-w-[85%] bg-white p-3 rounded-lg shadow">
                                    {t('whatsappChatLine3')}
                                    <div className="text-[10px] text-right text-gray-400 mt-1">
                                        10:01 AM
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

// Step Item Component
const StepItem = ({ icon, label }) => (
    <div className="flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 shadow-md">
            {icon}
        </div>
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
    </div>
);