import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled,    setScrolled]    = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={`sticky top-0 z-50 bg-white transition-all duration-200 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">F</span>
            </div>
            <span className="font-black text-xl text-gray-900 tracking-tight">FundRise</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/campaigns" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">
              {t('nav.discover')}
            </Link>
            <Link to="/campaigns?category=Medical" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">
              {t('nav.medical')}
            </Link>
            <Link to="/campaigns?category=Emergency" className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm">
              {t('nav.emergency')}
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/campaigns/create"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('nav.startFundrise')}
                </Link>
                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt={user.firstName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-gray-200" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(`${user?.firstName} ${user?.lastName}`)}
                      </div>
                    )}
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 text-sm">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        {[
                          { to: '/dashboard', icon: '⊞', label: t('nav.dashboard') },
                          { to: '/profile',   icon: '○', label: t('nav.myProfile') },
                          { to: '/my-donations', icon: '♡', label: t('nav.myDonations') },
                        ].map(item => (
                          <Link key={item.to} to={item.to}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <span className="text-base">{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                        {isAdmin && (
                          <Link to="/admin"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors">
                            <span className="text-base">🛡️</span>
                            {t('nav.adminPanel')}
                          </Link>
                        )}
                        <div className="border-t border-gray-100 mt-1">
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <span className="text-base">↩</span>
                            {t('nav.signOut')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="text-gray-700 hover:text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  {t('nav.signIn')}
                </Link>
                <Link to="/register"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                  {t('nav.startFundrise')}
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              <Link to="/campaigns" className="block py-2 text-gray-700 font-medium">{t('nav.discover')}</Link>
              <Link to="/campaigns?category=Medical" className="block py-2 text-gray-700">{t('nav.medical')}</Link>
              <Link to="/campaigns?category=Emergency" className="block py-2 text-gray-700">{t('nav.emergency')}</Link>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                        {getInitials(`${user?.firstName} ${user?.lastName}`)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <Link to="/dashboard" className="block py-2 text-gray-700">{t('nav.dashboard')}</Link>
                    <Link to="/campaigns/create" className="block py-2 text-emerald-600 font-semibold">{t('nav.startFundrise')}</Link>
                    <Link to="/profile" className="block py-2 text-gray-700">{t('nav.myProfile')}</Link>
                    <Link to="/my-donations" className="block py-2 text-gray-700">{t('nav.myDonations')}</Link>
                    {isAdmin && <Link to="/admin" className="block py-2 text-indigo-600">{t('nav.adminPanel')}</Link>}
                    <button onClick={handleLogout} className="block py-2 text-red-600 font-medium w-full text-left">
                      {t('nav.signOut')}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block text-center py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold">{t('nav.signIn')}</Link>
                    <Link to="/register" className="block text-center py-2.5 bg-emerald-600 rounded-lg text-white font-semibold">{t('nav.startFundrise')}</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close dropdown on outside click */}
      {profileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;
