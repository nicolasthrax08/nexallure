export default function Footer({ t, setPage, hasDeviceToken }) {
  const statusItems = [
    { label: t.footer_status_hosting_label,  value: t.footer_status_hosting },
    { label: t.footer_status_mainland_label, value: t.footer_status_not_active },
    { label: t.footer_status_audit_label,    value: t.footer_status_development },
    { label: t.footer_status_data_label,     value: t.footer_status_consent },
  ]

  function navigateAndScroll(id) {
    setPage?.('home')
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  const legalLinks = [
    { label: t.footer_link_privacy, onClick: () => setPage?.('privacy') },
    { label: t.footer_link_terms,   onClick: () => setPage?.('terms') },
  ]

  const handleSignOut = () => {
    try {
      localStorage.removeItem('nexallure_device_token')
      localStorage.removeItem('nexallure_lang')
      window.location.reload()
    } catch (e) {
      console.warn('Could not clear storage', e)
    }
  }

  return (
    <footer
      id="footer"
      style={{
        background: 'var(--off-white)',
        borderTop: '1px solid var(--border)',
        padding: '80px 0 40px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '48px',
            marginBottom: '48px',
          }}
        >
          {/* Col 1 */}
          <div>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '20px',
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}
            >
              Nexallure
            </div>
            <p
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginBottom: '16px',
              }}
            >
              {t.footer_tagline}
            </p>
            <a
              href="mailto:hello@nexallure.com"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '12px',
                color: 'var(--gold)',
                textDecoration: 'none',
              }}
            >
              hello@nexallure.com
            </a>
          </div>

          {/* Col 3 — Legal */}
          <div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '16px',
              }}
            >
              {t.footer_col3_title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {legalLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    boxShadow: 'none',
                    padding: 0,
                    textAlign: 'left',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: '14px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  {link.label}
                </button>
              ))}
              {hasDeviceToken && (
                <button
                  onClick={handleSignOut}
                  style={{
                    background: 'none',
                    border: 'none',
                    boxShadow: 'none',
                    padding: 0,
                    textAlign: 'left',
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    marginTop: '8px',
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
                  title="Clear remembered device and language preference"
                >
                  {t._lang === 'ZH' ? '退出登录 / 忘记此设备' : t._lang === 'TW' ? '登出 / 忘記此裝置' : 'Sign out / forget this device'}
                </button>
              )}
            </div>
          </div>

          {/* Col 4 — Pre-launch status (honest) */}
          <div>
            <div
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '16px',
              }}
            >
              {t.footer_col4_title}
            </div>
            <div>
              {statusItems.map((f, i) => (
                <div
                  key={f.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    gap: '12px',
                    borderBottom:
                      i < statusItems.length - 1
                        ? '1px solid rgba(42,51,72,0.15)'
                        : 'none',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {f.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      color: 'var(--gold)',
                      textAlign: 'right',
                    }}
                  >
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pre-launch disclaimer */}
        <div
          style={{
            background: 'var(--pure-white)',
            border: '1px solid var(--border)',
            padding: '16px 20px',
            marginBottom: '24px',
            fontFamily: "'IBM Plex Sans', sans-serif",
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          {t.footer_disclaimer}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '24px',
            borderTop: '1px solid var(--border)',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            {t.footer_copyright}
          </div>
          <div
            style={{
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            {t.footer_designed}
          </div>
        </div>
      </div>
    </footer>
  )
}