import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { LANGUAGES } from '../../i18n';

const Footer = () => {
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setLangOpen(false);
  };

  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">F</span>
              </div>
              <span className="font-black text-xl text-white tracking-tight">FundRise</span>
            </div>
            <p className="text-sm leading-relaxed">{t('footer.tagline')}</p>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.about')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about"        className="hover:text-white transition-colors">{t('footer.aboutUs')}</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">{t('footer.howItWorks')}</Link></li>
              <li><Link to="/pricing"      className="hover:text-white transition-colors">{t('footer.pricing')}</Link></li>
              <li><Link to="/blog"         className="hover:text-white transition-colors">{t('footer.blog')}</Link></li>
              <li><Link to="/careers"      className="hover:text-white transition-colors">{t('footer.careers')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help"    className="hover:text-white transition-colors">{t('footer.helpCenter')}</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">{t('footer.contactUs')}</Link></li>
              <li><Link to="/safety"  className="hover:text-white transition-colors">{t('footer.safety')}</Link></li>
              <li><Link to="/tips"    className="hover:text-white transition-colors">{t('footer.fundraisingTips')}</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.categories')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/campaigns?category=Medical"   className="hover:text-white transition-colors">{t('categories.Medical')}</Link></li>
              <li><Link to="/campaigns?category=Emergency" className="hover:text-white transition-colors">{t('categories.Emergency')}</Link></li>
              <li><Link to="/campaigns?category=Education" className="hover:text-white transition-colors">{t('categories.Education')}</Link></li>
              <li><Link to="/campaigns?category=Community" className="hover:text-white transition-colors">{t('categories.Community')}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>© {new Date().getFullYear()} FundRise. {t('footer.allRightsReserved')}</p>

          {/* Legal links */}
          <div className="flex gap-6 flex-wrap justify-center">
            <Link to="/privacy" className="hover:text-white transition-colors">{t('footer.privacyPolicy')}</Link>
            <Link to="/terms"   className="hover:text-white transition-colors">{t('footer.termsOfService')}</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">{t('footer.cookiePolicy')}</Link>
          </div>

          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 hover:bg-gray-800 transition-all text-sm text-gray-300"
              aria-label={t('footer.language')}
            >
              <span>{currentLang.flag}</span>
              <span>{currentLang.label}</span>
              <svg className={`w-3.5 h-3.5 transition-transform ${langOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full mb-2 right-0 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl min-w-[140px] z-50"
                >
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors ${
                        lang.code === i18n.language
                          ? 'bg-emerald-600/20 text-emerald-300'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                      {lang.code === i18n.language && (
                        <svg className="w-3.5 h-3.5 ml-auto text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Outside click to close */}
      {langOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
      )}
    </footer>
  );
};

export default Footer;
