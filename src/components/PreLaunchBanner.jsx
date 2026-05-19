export default function PreLaunchBanner({ t }) {
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        top: '64px',
        left: 0,
        right: 0,
        zIndex: 95,
        background: 'rgba(184,146,46,0.96)',
        color: '#0A0F1E',
        padding: '8px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '12px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.15)',
      }}
    >
      <span
        style={{
          background: '#0A0F1E',
          color: '#C9A84C',
          padding: '2px 8px',
          letterSpacing: '0.1em',
          fontWeight: 600,
        }}
      >
        {t.prelaunch_badge}
      </span>
      <span style={{ opacity: 0.92 }}>{t.prelaunch_text}</span>
    </div>
  )
}
