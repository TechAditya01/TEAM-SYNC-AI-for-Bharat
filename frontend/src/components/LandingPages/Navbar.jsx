import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import logo from '../../assets/logo.jpeg';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { language, setLanguage, t, languageOptions } = useLanguage();

    const handleNavigation = (e, targetId) => {
        e.preventDefault();
        if (location.pathname === '/') {
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate(`/#${targetId}`);
        }
    };

    const [isDarkMode, setIsDarkMode] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    React.useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname, location.hash]);

    React.useEffect(() => {
        if (!isMenuOpen) {
            document.body.style.overflow = '';
            return;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isMenuOpen]);

    React.useEffect(() => {
        const dark =
            localStorage.theme === 'dark' ||
            (!('theme' in localStorage) &&
                window.matchMedia('(prefers-color-scheme: dark)').matches);

        document.documentElement.classList.toggle('dark', dark);
        setIsDarkMode(dark);
    }, []);

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        document.documentElement.classList.toggle('dark', newMode);
        localStorage.theme = newMode ? 'dark' : 'light';
        setIsDarkMode(newMode);
    };

    const isDashboard = location.pathname === '/dashboard';
    const isAuthPage = ['/login', '/signup', '/register', '/forgot-password']
        .some(p => location.pathname.startsWith(p));

    return (
        <>
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <img
                        src={logo}
                        alt={t('brandLogoAlt')}
                        className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                        <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight truncate">
                            {t('brandName')}
                        </h1>
                        <span className="hidden sm:block text-xs text-slate-500 dark:text-white/70 truncate">
                            {t('civicTagline')}
                        </span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                {!isDashboard && (
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700 dark:text-white/80">
                        <Link to="/" className="hover:text-slate-900 dark:hover:text-white">{t('home')}</Link>
                        <a onClick={(e) => handleNavigation(e, 'features')} className="cursor-pointer hover:text-slate-900 dark:hover:text-white">{t('features')}</a>
                        <a onClick={(e) => handleNavigation(e, 'whatsapp')} className="cursor-pointer hover:text-slate-900 dark:hover:text-white">{t('whatsapp')}</a>
                        <a onClick={(e) => handleNavigation(e, 'about')} className="cursor-pointer hover:text-slate-900 dark:hover:text-white">{t('about')}</a>
                    </div>
                )}

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        aria-label={t('language')}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200"
                    >
                        {languageOptions.map((option) => (
                            <option key={option.code} value={option.code}>{option.label}</option>
                        ))}
                    </select>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition"
                        title="Toggle Theme"
                    >
                        {isDarkMode ? '🌞' : '🌙'}
                    </button>

                    {!isDashboard && !isAuthPage && (
                        <Link
                            to="/login"
                            className="px-5 py-2 rounded-lg border border-slate-300 dark:border-white/20 text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
                        >
                            {t('login')}
                        </Link>
                    )}

                    {isDashboard && (
                        <Link
                            to="/"
                            className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
                        >
                            {t('logout')}
                        </Link>
                    )}
                </div>

                {/* Mobile Button */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden relative z-70 p-2 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white"
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>
            </div>

        </nav>

        {createPortal(
            <div className={`md:hidden fixed inset-0 z-60 text-slate-900 dark:text-white transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <button
                    aria-label="Close menu backdrop"
                    onClick={() => setIsMenuOpen(false)}
                    className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
                />
                <div className={`absolute right-0 top-0 h-full w-[88%] max-w-90 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl px-5 pb-10 pt-5 flex flex-col text-lg overflow-y-auto transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                    <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2 min-w-0">
                            <img
                                src={logo}
                                alt={t('brandLogoAlt')}
                                className="w-9 h-9 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0">
                                <h2 className="text-sm font-semibold truncate text-slate-900 dark:text-white">{t('brandName')}</h2>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{t('civicTagline')}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            aria-label="Close menu"
                            className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white grid place-items-center"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="pt-5 flex flex-col gap-2">
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-white/10 font-medium">{t('home')}</Link>
                        <a onClick={(e) => { handleNavigation(e, 'features'); setIsMenuOpen(false); }} className="px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">{t('features')}</a>
                        <a onClick={(e) => { handleNavigation(e, 'whatsapp'); setIsMenuOpen(false); }} className="px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">{t('whatsapp')}</a>
                        <a onClick={(e) => { handleNavigation(e, 'about'); setIsMenuOpen(false); }} className="px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10">{t('about')}</a>
                    </div>

                    <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            aria-label={t('language')}
                            className="w-full px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                        >
                            {languageOptions.map((option) => (
                                <option key={option.code} value={option.code}>{option.label}</option>
                            ))}
                        </select>

                        <button
                            onClick={toggleTheme}
                            className="w-full py-3 rounded-xl bg-slate-100 dark:bg-white/10 font-medium"
                        >
                            {t('switchTheme')}
                        </button>

                        {!isAuthPage && !isDashboard && (
                            <Link
                                to="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="block w-full py-3 rounded-xl border border-slate-300 dark:border-white/20 text-center font-medium"
                            >
                                {t('login')}
                            </Link>
                        )}
                    </div>

                </div>
            </div>,
            document.body
        )}
        </>
    );
}