import { useCallback, useEffect, useState } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { translations } from './i18n'
import { AuthProvider, useAuth } from './context/Auth'
import Nav from './components/Nav'
import PreLaunchBanner from './components/PreLaunchBanner'
import Hero from './components/Hero'
import SupplierForm from './components/SupplierForm'
import Compliance from './components/Compliance'
import BuyersPage from './pages/BuyersPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import Footer from './components/Footer'
import MarketGuidePage from './pages/MarketGuidePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ErrorBoundary from './components/ErrorBoundary'
import Preloader from './components/Preloader'
import WatchlistDashboard from './components/WatchlistDashboard.jsx'
import { motion } from 'framer-motion'

const pagePaths = {
  home: '/',
  buyers: '/buyers',
  marketGuide: '/market-guide',
  monitor: '/monitor',
  privacy: '/privacy',
  terms: '/terms',
  login: '/login',
  register: '/register',
}

function AboutSection({ t }) {
  const roadmapRows = [
    { status: t.about_status_live, tool: t.about_tool_mg },
    { status: t.about_status_june, tool: t.about_tool_sample },
    { status: t.about_status_july, tool: t.about_tool_quoting },
  ]

  return (
    <section style={{ background: 'var(--off-white)', padding: '140px 32px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
        <div id="roadmap" style={{ position: 'relative', top: '-80px' }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ maxWidth: '720px', marginBottom: '48px' }}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '40px',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              letterSpacing: '-0.01em',
              marginBottom: '24px',
            }}
          >
            {t.about_h2}
          </h2>
          <p
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '16px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '16px',
            }}
          >
            {t.about_p1}
          </p>
          <p
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '16px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}
          >
            {t.about_p2}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: '2px',
              background: 'var(--border)',
              borderTop: '3px solid var(--gold)',
            }}
          >
            <div
              style={{
                background: 'var(--pure-white)',
                padding: '12px 20px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {t.about_roadmap_status}
            </div>
            <div
              style={{
                background: 'var(--pure-white)',
                padding: '12px 20px',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {t.about_roadmap_tool}
            </div>
          </div>
          {roadmapRows.map((row, i) => (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: '2px',
                background: 'var(--border)',
              }}
            >
              <div
                style={{
                  background: 'var(--off-white)',
                  padding: '16px 20px',
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                }}
              >
                {row.status}
              </div>
              <div
                style={{
                  background: 'var(--off-white)',
                  padding: '16px 20px',
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                }}
              >
                {row.tool}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function HomePage({ t, setPage }) {
  return (
    <>
      <section
        style={{
          position: 'relative',
          minHeight: '85vh',
          background: 'var(--midnight-navy)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '160px 48px 80px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            backgroundImage: `linear-gradient(var(--border-dark) 1px, transparent 1px), linear-gradient(90deg, var(--border-dark) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
            opacity: 0.15,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px',
              color: 'var(--signal-gold)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              marginBottom: '20px',
            }}
          >
            {t.home_mg_eyebrow}
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(40px, 5vw, 60px)',
              fontWeight: 700,
              color: 'var(--warm-white)',
              lineHeight: 1.12,
              marginBottom: '24px',
            }}
          >
            {t.home_mg_h1}
          </h1>
          <p
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '18px',
              color: 'var(--text-light)',
              lineHeight: 1.65,
              margin: '0 auto 36px',
              maxWidth: '640px',
            }}
          >
            {t.home_mg_sub}
          </p>
          <button
            onClick={() => setPage('marketGuide')}
            style={{
              background: 'var(--signal-gold)',
              color: 'var(--midnight-navy)',
              border: '1px solid var(--gold-shadow)',
              padding: '16px 32px',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            {t.home_mg_cta}
          </button>
        </div>
      </section>
      <Hero t={t} setPage={setPage} />
      <AboutSection t={t} />
      <Compliance t={t} />
    </>
  )
}

function AppInner() {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('nexallure_lang')
    return saved || 'ZH'
  })
  const [location, navigate] = useLocation()
  const [hasDeviceToken, setHasDeviceToken] = useState(false)
  const { session } = useAuth()

  // This function receives the language selected inside the Preloader component
  const handlePreloaderComplete = useCallback((selectedLang) => {
    if (selectedLang) {
      setLang(selectedLang)
    }
  }, [])

  const t = { ...(translations[lang] || translations.ZH), _lang: lang }

  const setPage = useCallback(
    (page) => {
      navigate(pagePaths[page] || pagePaths.home)
    },
    [navigate],
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  useEffect(() => {
    const map = { EN: 'en', ZH: 'zh-CN', TW: 'zh-TW' }
    document.documentElement.lang = map[lang] || 'zh-CN'
  }, [lang])

  useEffect(() => {
    localStorage.setItem('nexallure_lang', lang)
  }, [lang])

  useEffect(() => {
    const token = localStorage.getItem('nexallure_device_token')
    if (token) {
      setHasDeviceToken(true)
    }
  }, [])

  return (
    <>
      {![ "/register", "/login", "/privacy", "/terms"].includes(location) && (
        <Preloader lang={lang} onComplete={handlePreloaderComplete} />
      )}
      <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
        <Nav setPage={setPage} lang={lang} setLang={setLang} t={t} />
        <PreLaunchBanner t={t} />
        <Switch>
          <Route path="/buyers">
            <BuyersPage setPage={setPage} t={t} />
          </Route>
          <Route path="/market-guide">
            <MarketGuidePage t={t} setPage={setPage} />
          </Route>

          {/* Watchlist Dashboard Page Route */}
          <Route path="/monitor">
            <WatchlistDashboard userId={session?.user?.id} />
          </Route>

          <Route path="/privacy">
            <PrivacyPage setPage={setPage} t={t} />
          </Route>
          <Route path="/terms">
            <TermsPage setPage={setPage} t={t} />
          </Route>
          <Route path="/login">
            <LoginPage t={t} setPage={setPage} />
          </Route>
          <Route path="/register">
            <RegisterPage t={t} setPage={setPage} />
          </Route>
          <Route>
            <HomePage t={t} setPage={setPage} />
          </Route>
        </Switch>
        <Footer t={t} setPage={setPage} hasDeviceToken={hasDeviceToken} />
      </div>
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ErrorBoundary>
  )
}
