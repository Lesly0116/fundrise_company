import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { campaignAPI } from '../services/api';
import CampaignCard from '../components/campaign/CampaignCard';
import { Spinner } from '../components/common/UI';
import { CATEGORIES, formatCurrency } from '../utils/helpers';

/* ─── Unsplash image references ──────────────────────────────────────────────
   All images are sourced from Unsplash (free for commercial use).
   To use them locally:
     1. Download each from the URL below
     2. Place in /public/images/
     3. Replace the src below with e.g. "/images/hero-main.jpg"

   Hero background:
     https://unsplash.com/photos/people-doing-volunteer-work-QwqDpRFnFss
     (download → save as /public/images/hero-bg.jpg)

   Category imagery (store as /public/images/cat-{name}.jpg):
     Medical:     https://unsplash.com/photos/man-in-white-lab-coat-L8tWZT4CcVQ
     Community:   https://unsplash.com/photos/group-of-people-raising-right-hand-fnztlIb52gU
     Education:   https://unsplash.com/photos/books-on-shelf-NIJuEQw0RKg
     Emergency:   https://unsplash.com/photos/red-cross-sign-zjbDMJMQBr0
     Environment: https://unsplash.com/photos/green-trees-under-white-sky-XMFZqrGyV-Q

   All are licensed under the Unsplash License — free to download and use.
   See: https://unsplash.com/license
─────────────────────────────────────────────────────────────────────────── */

const CATEGORY_ICONS = {
  Medical: '🏥', Emergency: '🆘', Education: '🎓', Community: '🤝',
  Animals: '🐾', Environment: '🌱', Memorial: '🕊️', Business: '💼',
  Sports: '⚽', General: '❤️',
};

// ─── Reusable animation variants ────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };
const fadeIn  = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } };

// ─── Hook: animate section when scrolled into view ──────────────────────────
const useReveal = () => {
  const ref  = useRef(null);
  const isIn = useInView(ref, { once: true, margin: '-80px' });
  return [ref, isIn];
};

// ─── Animated counter ───────────────────────────────────────────────────────
const Counter = ({ target, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const ref   = useRef(null);
  const isIn  = useInView(ref, { once: true });

  useEffect(() => {
    if (!isIn) return;
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ''));
    const duration = 1400;
    const steps    = 50;
    const step     = numeric / steps;
    let current    = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= numeric) { setCount(numeric); clearInterval(timer); }
      else setCount(Math.floor(current * 10) / 10);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isIn, target]);

  const display = Number.isInteger(count) ? count : count.toFixed(1);
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
};

// ─── Main Component ──────────────────────────────────────────────────────────
const HomePage = () => {
  const { t } = useTranslation();
  const navigate   = useNavigate();
  const [featured, setFeatured]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState('');

  // Parallax on hero
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 120]);

  useEffect(() => {
    campaignAPI.getFeatured()
      .then(r => setFeatured(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) navigate(`/campaigns?q=${encodeURIComponent(search.trim())}`);
  };

  // Section refs
  const [catRef,  catIn]  = useReveal();
  const [featRef, featIn] = useReveal();
  const [howRef,  howIn]  = useReveal();
  const [trustRef, trustIn] = useReveal();

  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] flex flex-col justify-center overflow-hidden bg-[#0a1628]"
      >
        {/* Animated mesh gradient background */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ y: heroY }}
          aria-hidden
        >
          <div className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 80% 60% at 20% 40%, rgba(2,169,92,0.28) 0%, transparent 60%),
                radial-gradient(ellipse 60% 80% at 80% 20%, rgba(2,110,59,0.18) 0%, transparent 55%),
                radial-gradient(ellipse 50% 50% at 60% 80%, rgba(1,82,48,0.22) 0%, transparent 50%)
              `,
            }}
          />
          {/* Subtle grain texture */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
          />
        </motion.div>

        {/* Floating decorative orbs */}
        <motion.div
          className="absolute top-24 right-[8%] w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(2,169,92,0.12) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
        <motion.div
          className="absolute bottom-32 left-[5%] w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(2,169,92,0.08) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          aria-hidden
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Trust badge */}
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm font-medium backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t('hero.badge')}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6"
              style={{ fontFamily: "'DM Serif Display', 'Georgia', serif" }}
            >
              {t('hero.headline1')}
              <br />
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #02a95c 0%, #4ade80 50%, #02a95c 100%)' }}>
                  {t('hero.headline2')}
                </span>
                {/* Animated underline */}
                <motion.span
                  className="absolute -bottom-1 left-0 h-[3px] rounded-full"
                  style={{ background: 'linear-gradient(90deg, #02a95c, #4ade80)' }}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.8, duration: 0.7, ease: 'easeOut' }}
                  aria-hidden
                />
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto"
            >
              {t('hero.subheadline')}
            </motion.p>

            {/* Search */}
            <motion.form
              variants={fadeUp}
              onSubmit={handleSearch}
              className="flex gap-2 max-w-xl mx-auto mb-8"
            >
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={t('hero.searchPlaceholder')}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-base"
                />
              </div>
              <motion.button
                type="submit"
                className="px-6 py-4 rounded-2xl font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #02a95c, #028a4a)' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {t('hero.searchBtn')}
              </motion.button>
            </motion.form>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/campaigns/create"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white shadow-lg shadow-emerald-900/40 transition-all text-base"
                  style={{ background: 'linear-gradient(135deg, #02a95c 0%, #028a4a 100%)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('hero.startBtn')}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/campaigns"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold border-2 border-white/25 text-white hover:bg-white/10 transition-all text-base backdrop-blur-sm"
                >
                  {t('hero.exploreBtn')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="mt-20 grid grid-cols-3 gap-px max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
          >
            {[
              { value: '3', suffix: 'B+', prefix: '$', label: t('stats.raised') },
              { value: '150', suffix: 'M+', prefix: '', label: t('stats.donors') },
              { value: '0', suffix: '%', prefix: '', label: t('stats.fee') },
            ].map(({ value, suffix, prefix, label }) => (
              <div key={label}
                className="text-center px-6 py-6 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)' }}>
                <div className="text-3xl md:text-4xl font-black text-white mb-1">
                  <Counter target={value} suffix={suffix} prefix={prefix} />
                </div>
                <div className="text-slate-400 text-sm">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom wave separator */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 80L1440 80L1440 20C1200 70 960 0 720 20C480 40 240 0 0 20L0 80Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50" ref={catRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={catIn ? 'show' : 'hidden'}
          >
            <motion.h2 variants={fadeUp}
              className="text-3xl font-black text-gray-900 mb-8 tracking-tight">
              {t('categories.title')}
            </motion.h2>
            <motion.div
              variants={stagger}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3"
            >
              {CATEGORIES.map((cat, i) => (
                <motion.div key={cat} variants={fadeUp} custom={i}>
                  <Link
                    to={`/campaigns?category=${cat}`}
                    className="group flex flex-col items-center gap-2.5 p-5 rounded-2xl bg-white border border-gray-100 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                  >
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                      {CATEGORY_ICONS[cat] || '❤️'}
                    </span>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-700 transition-colors">
                      {t(`categories.${cat}`, cat)}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED CAMPAIGNS ───────────────────────────────────────────── */}
      <section className="py-16 bg-white" ref={featRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={featIn ? 'show' : 'hidden'}
          >
            <motion.div variants={fadeUp} className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  {t('featured.title')}
                </h2>
                <p className="text-gray-500 mt-1">{t('featured.subtitle')}</p>
              </div>
              <Link
                to="/campaigns"
                className="hidden sm:flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold text-sm transition-colors"
              >
                {t('featured.seeAll')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-16"><Spinner size="lg" /></div>
            ) : featured.length > 0 ? (
              <motion.div
                variants={stagger}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {featured.map((campaign, i) => (
                  <motion.div key={campaign.id} variants={fadeUp} custom={i}
                    whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <CampaignCard campaign={campaign} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div variants={fadeIn}
                className="text-center py-16 text-gray-500">
                {t('featured.empty')}
              </motion.div>
            )}

            <motion.div variants={fadeUp} className="sm:hidden mt-6 text-center">
              <Link to="/campaigns" className="btn-primary inline-block">
                {t('featured.seeAll')}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50" ref={howRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={howIn ? 'show' : 'hidden'}
          >
            <motion.h2 variants={fadeUp}
              className="text-3xl font-black text-gray-900 text-center mb-16 tracking-tight">
              {t('howItWorks.title')}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-10 left-[16.6%] right-[16.6%] h-px bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200" aria-hidden />
              {[
                { num: '01', icon: '✏️', title: t('howItWorks.step1Title'), desc: t('howItWorks.step1Desc') },
                { num: '02', icon: '📣', title: t('howItWorks.step2Title'), desc: t('howItWorks.step2Desc') },
                { num: '03', icon: '💰', title: t('howItWorks.step3Title'), desc: t('howItWorks.step3Desc') },
              ].map((step, i) => (
                <motion.div key={step.num} variants={fadeUp} custom={i}
                  className="text-center relative">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 mx-auto"
                    style={{ background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' }}>
                    <span className="text-3xl">{step.icon}</span>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST SIGNALS ────────────────────────────────────────────────── */}
      <section className="py-20 bg-white" ref={trustRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={trustIn ? 'show' : 'hidden'}
          >
            <motion.h2 variants={fadeUp}
              className="text-3xl font-black text-gray-900 text-center mb-12 tracking-tight">
              {t('trust.title')}
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: '🎯',
                  title: t('trust.zeroFeeTitle'),
                  desc: t('trust.zeroFeeDesc'),
                  bg: 'from-emerald-50 to-green-50',
                  accent: 'border-emerald-200',
                },
                {
                  icon: '🔒',
                  title: t('trust.secureTitle'),
                  desc: t('trust.secureDesc'),
                  bg: 'from-blue-50 to-indigo-50',
                  accent: 'border-blue-200',
                },
                {
                  icon: '⚡',
                  title: t('trust.fastTitle'),
                  desc: t('trust.fastDesc'),
                  bg: 'from-amber-50 to-orange-50',
                  accent: 'border-amber-200',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  custom={i}
                  className={`p-8 rounded-3xl border bg-gradient-to-br ${item.bg} ${item.accent}`}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden" style={{ background: '#0a1628' }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 50%, rgba(2,169,92,0.20) 0%, transparent 70%)`,
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight"
              style={{ fontFamily: "'DM Serif Display', 'Georgia', serif" }}>
              {t('cta.title')}
            </h2>
            <p className="text-slate-300 text-lg mb-10">{t('cta.subtitle')}</p>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/campaigns/create"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-white text-lg shadow-2xl shadow-emerald-900/50 transition-all"
                style={{ background: 'linear-gradient(135deg, #02a95c 0%, #028a4a 100%)' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('cta.startBtn')}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
