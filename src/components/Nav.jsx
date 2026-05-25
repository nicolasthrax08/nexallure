import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/Auth'
import { NotificationFeed } from './NotificationFeed.jsx'

export default function Nav({ setPage, lang, setLang, t }) {
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)
  const { session, signOut } = useAuth()

  const scrollTo = (id) => {
    if (id === 'marketGuide') {
      setPage('marketGuide')
      window.scrollTo(0, 0)
      return
    }
    if (id === 'monitor') { // <--- Add this switch case interception loop
      setPage('monitor')
      window.scrollTo(0, 0)
      return
    }
    if (id === 'buyers') {
      setPage('buyers')
      window.scrollTo(0, 0)
      return
    }
    // For section ids: go home first, then scroll to the section.
    setPage('home')
    setTimeout(() => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  useEffect(() => {
    const handleClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navLinks = [
    { label: t.nav_market_guide, target: 'marketGuide' },
    { label: t.nav_monitor || 'MONITOR', target: 'monitor' },
    { label: t.nav_compliance, target: 'compliance' },
    { label: t.nav_about,      target: 'footer' },
  ]

  // Language options — Chinese-only labels, no English qualifier.
  const langOptions = [
    { code: 'EN', label: 'English' },
    { code: 'ZH', label: '简体中文' },
    { code: 'TW', label: '繁體中文' },
  ]

  const currentLangLabel = langOptions.find(o => o.code === lang)?.label || '简体中文'

  return (
    <>
      <style>{`
        .nav-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 64px;
          z-index: 100;
          background: rgba(10,15,30,0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-dark);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          gap: 24px;
        }
        .nav-logo {
          background: none;
          border: none;
          box-shadow: none;
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--warm-white);
          letter-spacing: -0.02em;
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .nav-links {
          display: flex;
          gap: 40px;
          align-items: center;
          flex: 1;
          justify-content: center;
        }
        .nav-link-btn {
          background: none;
          border: none;
          box-shadow: none;
          color: #94A3B8;
          font-size: 13px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          cursor: pointer;
          padding: 4px 0;
          transition: color 150ms ease;
          white-space: nowrap;
        }
        .nav-link-btn:hover {
          color: #F7F6F2;
        }
        .nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-shrink: 0;
        }
        .lang-button {
          background: transparent;
          border: 1px solid #2A3348;
          color: #94A3B8;
          padding: 8px 14px;
          font-size: 13px;
          font-family: 'IBM Plex Mono', monospace;
          cursor: pointer;
          min-width: 110px;
          text-align: left;
          white-space: nowrap;
        }
        .lang-dropdown {
          position: absolute;
          top: 44px;
          right: 0;
          min-width: 180px;
          background: #1C2333;
          border: 1px solid #2A3348;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          z-index: 200;
        }

        /* Mobile: 768px and below */
        @media (max-width: 768px) {
          .nav-container {
            padding: 0 20px;
            height: 56px;
            gap: 12px;
          }
          .nav-links {
            display: none;
          }
          .nav-logo {
            font-size: 20px;
          }
          .lang-button {
            min-width: 100px;
            padding: 7px 12px;
            font-size: 12px;
          }
          .lang-dropdown {
            min-width: 160px;
            right: -8px;
          }
        }

        /* Small mobile: 414px, 390px, 375px */
        @media (max-width: 414px) {
          .nav-container {
            padding: 0 16px;
          }
          .nav-logo {
            font-size: 19px;
            letter-spacing: -0.01em;
          }
          .lang-button {
            min-width: 92px;
            padding: 6px 10px;
            font-size: 12px;
          }
        }

        @media (max-width: 390px) {
          .nav-container {
            padding: 0 14px;
          }
        }

        @media (max-width: 375px) {
          .nav-container {
            padding: 0 12px;
          }
          .nav-logo {
            font-size: 18px;
          }
          .lang-button {
            min-width: 88px;
            padding: 6px 9px;
          }
        }
      `}</style>

<nav className="nav-container">
        <button
          className="nav-logo"
          onClick={() => { setPage('home'); window.scrollTo(0, 0) }}
        >
          Nexallure
        </button>

        <div className="nav-links">
          {navLinks.map((link) => (
            <button
              key={link.label}
              className="nav-link-btn"
              onClick={() => scrollTo(link.target)}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="nav-right">
          {/* Inject the live real-time bell drop component if user session is active */}
          {session && <NotificationFeed userId={session.user?.id} />}

          {session ? (
            <button
              onClick={signOut}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: '13px',
                fontFamily: "'IBM Plex Sans', sans-serif",
                cursor: 'pointer',
                letterSpacing: '0.04em'
              }}
            >
              SIGN OUT
            </button>
          ) : (
            <button
              onClick={() => setPage('login')}
              style={{
                background: 'none',
                border: '1px solid #2A3348',
                color: '#94A3B8',
                fontSize: '13px',
                padding: '8px 14px',
                fontFamily: "'IBM Plex Sans', sans-serif",
                cursor: 'pointer'
              }}
            >
              {t.nav_signin}
            </button>
          )}
          <div ref={langRef} style={{ position: 'relative' }}>
            <button
              className="lang-button"
              aria-haspopup="menu"
              aria-expanded={langOpen}
              onClick={(e) => {
                e.stopPropagation()
                setLangOpen(prev => !prev)
              }}
            >
              {currentLangLabel} ▾
            </button>

            {langOpen && (
              <div
                role="menu"
                className="lang-dropdown"
              >
                {langOptions.map((opt, i) => (
                  <button
                    key={opt.code}
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation()
                      setLang(opt.code)
                      setLangOpen(false)
                    }}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 16px',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#F7F6F2',
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      borderTop: 'none',
                      borderRight: 'none',
                      borderBottom: i < langOptions.length - 1 ? '1px solid #2A3348' : 'none',
                      borderLeft:
                        lang === opt.code ? '2px solid #C9A84C' : '2px solid transparent',
                      background: 'transparent',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}