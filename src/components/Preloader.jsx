import { useEffect, useRef, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { feature } from "topojson-client"

const STORAGE_KEY = "nexallure_visited"

const taglines = {
  EN: "Find your best export markets in seconds",
  ZH: "几秒内找到您最佳的出口市场",
  TW: "幾秒內找到您最佳的出口市場",
}

const GLITCH_FONTS = [
  "'Courier New', monospace",
  "'Arial Black', sans-serif",
  "'Georgia', serif",
  "'Trebuchet MS', sans-serif",
  "'Impact', sans-serif",
  "'Lucida Console', monospace",
  "'Times New Roman', serif",
  "'Verdana', sans-serif",
  "'Comic Sans MS', cursive",
  "'Playfair Display', serif",
]

const FINAL_FONT = "'Playfair Display', serif"

let cachedWorldPaths = null

function lngLatToXY(lng, lat, width, height) {
  const x = (lng + 180) * (width / 360)
  const y = (90 - lat) * (height / 180)
  return [x, y]
}

function geoToSvgPath(feature, width, height) {
  if (feature.id === "10") return null // Antarctica
  const geom = feature.geometry
  if (!geom) return null
  const rings = geom.type === "Polygon"
    ? [geom.coordinates]
    : geom.type === "MultiPolygon"
    ? geom.coordinates
    : []
  return rings.map(polygon =>
    polygon.map(ring => {
      for (let i = 1; i < ring.length; i++) {
        if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) return ""
      }
      const points = ring.map(([lng, lat]) => lngLatToXY(lng, lat, width, height))
      return "M" + points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L") + "Z"
    }).join(" ")
  ).join(" ")
}

async function loadWorldPaths() {
  if (cachedWorldPaths) return cachedWorldPaths
  const res = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json")
  const topology = await res.json()
  const countries = feature(topology, topology.objects.countries)
  cachedWorldPaths = countries.features.map(f => geoToSvgPath(f, 500, 250)).filter(Boolean)
  return cachedWorldPaths
}

export default function Preloader({ lang = "EN" }) {
  const isFirstVisit = !localStorage.getItem(STORAGE_KEY)
  const [showFull, setShowFull] = useState(isFirstVisit)
  const [showBar, setShowBar] = useState(!isFirstVisit)
  const [exiting, setExiting] = useState(false)
  const [worldPaths, setWorldPaths] = useState([])
  const [glowActive, setGlowActive] = useState(false)

  // Font glitch state
  const [currentFont, setCurrentFont] = useState(GLITCH_FONTS[0])
  const [fontSettled, setFontSettled] = useState(false)

  // Stage: 0=map, 1=glitch, 2=settled, 3=tagline, 4=button
  const [stage, setStage] = useState(0)

  const canvasRef = useRef(null)
  const glitchRef = useRef(null)

  const tagline = taglines[lang] ?? taglines.EN
  const isChinese = lang === "ZH" || lang === "TW"

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "true")
      setShowFull(false)
    }, 600)
  }, [])

  // Preload world map immediately on mount — don't wait for showFull
  useEffect(() => {
    loadWorldPaths().then(paths => {
      setWorldPaths(paths)
      setGlowActive(true)
    }).catch(() => {})
  }, [])

  // Particle canvas
  useEffect(() => {
    if (!showFull) return
    const canvas = canvasRef.current
    if (!canvas) return
    const setSize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    setSize()
    const ctx = canvas.getContext("2d")
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.4,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      o: Math.random() * 0.4 + 0.1,
    }))
    let raf
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.o})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [showFull])

  // Stage sequencing
  useEffect(() => {
    if (!showFull) return
    const t1 = setTimeout(() => setStage(1), 300)   // start glitch
    const t2 = setTimeout(() => setStage(2), 1200)  // font settles
    const t3 = setTimeout(() => setStage(3), 1500)  // tagline
    const t4 = setTimeout(() => setStage(4), 2000)  // button
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [showFull])

  // Font glitch effect — fires 8-10 times in ~900ms
  useEffect(() => {
    if (stage !== 1) return
    const totalFlickers = 9
    let count = 0
    const interval = 90 // ms between flickers

    glitchRef.current = setInterval(() => {
      const randomFont = GLITCH_FONTS[Math.floor(Math.random() * (GLITCH_FONTS.length - 1))]
      setCurrentFont(randomFont)
      count++
      if (count >= totalFlickers) {
        clearInterval(glitchRef.current)
      }
    }, interval)

    return () => clearInterval(glitchRef.current)
  }, [stage])

  // Settle on final font
  useEffect(() => {
    if (stage >= 2) {
      setCurrentFont(FINAL_FONT)
      setFontSettled(true)
    }
  }, [stage])

  // Return visit bar
  useEffect(() => {
    if (!showBar) return
    const t = setTimeout(() => setShowBar(false), 900)
    return () => clearTimeout(t)
  }, [showBar])

  return (
    <>
      {/* Return visit bar */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            key="bar"
            style={{ position: "fixed", top: 0, left: 0, height: "2px", zIndex: 9999, background: "#c9a84c" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* Cinematic preloader */}
      <AnimatePresence>
        {showFull && (
          <motion.div
            key="preloader"
            initial={{ y: 0 }}
            animate={{ y: exiting ? "-100%" : 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            style={{
              position: "fixed",
              top: 0, left: 0,
              width: "100%", height: "100%",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              background: "#0A0F1E",
            }}
          >
            {/* Particles */}
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute", top: 0, left: 0,
                width: "100%", height: "100%",
                pointerEvents: "none",
              }}
            />

            {/* World map + gold glow */}
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(700px, 95vw)",
            }}>
              {/* Gold radial glow pulse from center */}
              {glowActive && (
                <motion.div
                  style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.08) 40%, transparent 70%)",
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                  initial={{ width: 0, height: 0, opacity: 0 }}
                  animate={{
                    width: ["0px", "600px", "800px", "600px"],
                    height: ["0px", "300px", "400px", "300px"],
                    opacity: [0, 0.9, 0.5, 0.3],
                  }}
                  transition={{ duration: 2.5, ease: "easeOut", times: [0, 0.3, 0.6, 1] }}
                />
              )}

              {/* Map SVG */}
              <motion.svg
                viewBox="0 0 500 250"
                style={{ width: "100%", position: "relative", zIndex: 2 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: worldPaths.length ? 1 : 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                {/* Subtle base fill for oceans */}
                <rect width="500" height="250" fill="rgba(10,15,30,0)" />

                {worldPaths.map((d, i) => (
                  <motion.path
                    key={i}
                    d={d}
                    fill="rgba(201,168,76,0.07)"
                    stroke="rgba(201,168,76,0.5)"
                    strokeWidth="0.3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 + i * 0.002 }}
                  />
                ))}

                {/* Latitude lines for drama */}
                {[-60, -30, 0, 30, 60].map(lat => {
                  const y = (90 - lat) * (250 / 180)
                  return (
                    <line
                      key={lat}
                      x1="0" y1={y} x2="500" y2={y}
                      stroke="rgba(201,168,76,0.08)"
                      strokeWidth="0.5"
                    />
                  )
                })}
                {/* Longitude lines */}
                {[-120, -60, 0, 60, 120].map(lng => {
                  const x = (lng + 180) * (500 / 360)
                  return (
                    <line
                      key={lng}
                      x1={x} y1="0" x2={x} y2="250"
                      stroke="rgba(201,168,76,0.08)"
                      strokeWidth="0.5"
                    />
                  )
                })}
              </motion.svg>
            </div>

            {/* Wordmark — glitch then settle */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 1 ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: "relative",
                zIndex: 20,
                color: fontSettled ? "white" : "rgba(255,255,255,0.9)",
                fontSize: "clamp(26px, 6vw, 38px)",
                fontFamily: currentFont,
                fontWeight: fontSettled ? 600 : 700,
                letterSpacing: fontSettled ? "0.02em" : "0em",
                transition: fontSettled
                  ? "font-family 0.3s ease, letter-spacing 0.3s ease"
                  : "none",
                textShadow: glowActive && stage >= 2
                  ? "0 0 30px rgba(201,168,76,0.4)"
                  : "none",
              }}
            >
              Nexallure
            </motion.span>

            {/* Tagline — simple fade after font settles */}
            <AnimatePresence>
              {stage >= 3 && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{
                    position: "relative",
                    zIndex: 20,
                    marginTop: "12px",
                    fontSize: isChinese ? "13px" : "11px",
                    fontFamily: isChinese
                      ? "'IBM Plex Sans', sans-serif"
                      : "'IBM Plex Mono', monospace",
                    letterSpacing: isChinese ? "0.05em" : "0.12em",
                    color: "rgba(255,255,255,0.5)",
                    textTransform: isChinese ? "none" : "uppercase",
                    textAlign: "center",
                    padding: "0 24px",
                    margin: "12px 24px 0",
                  }}
                >
                  {tagline}
                </motion.p>
              )}
            </AnimatePresence>

            {/* CTA Button */}
            <AnimatePresence>
              {stage >= 4 && (
                <motion.button
                  onClick={dismiss}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    boxShadow: [
                      "0 0 0px rgba(201,168,76,0)",
                      "0 0 22px rgba(201,168,76,0.7)",
                      "0 0 8px rgba(201,168,76,0.3)",
                    ],
                  }}
                  transition={{
                    opacity: { duration: 0.4 },
                    y: { duration: 0.4 },
                    boxShadow: { duration: 1.4, delay: 0.4, times: [0, 0.4, 1] },
                  }}
                  style={{
                    position: "relative",
                    zIndex: 20,
                    marginTop: "36px",
                    background: "#c9a84c",
                    color: "#0A0F1E",
                    border: "none",
                    padding: "13px 32px",
                    fontFamily: "'IBM Plex Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {lang === "ZH"
                    ? "探索您的市场"
                    : lang === "TW"
                    ? "探索您的市場"
                    : "Discover Your Markets"}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}