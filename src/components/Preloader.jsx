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

  useEffect(() => {
    loadWorldPaths().then(paths => {
      setWorldPaths(paths)
      setGlowActive(true)
    }).catch(() => {})
  }, [])

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

  useEffect(() => {
    if (!showFull) return
    const t1 = setTimeout(() => setStage(1), 300)   // start glitch
    const t2 = setTimeout(() => setStage(2), 1110)  // 300 + 810 = 1110ms (Font settles)
    const t3 = setTimeout(() => setStage(3), 1500)  // tagline
    const t4 = setTimeout(() => setStage(4), 2000)  // button
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [showFull])

  // UPDATED: Font glitch effect - 9 flickers at 90ms intervals
  useEffect(() => {
    if (stage !== 1) return
    const totalFlickers = 9
    let count = 0
    const interval = 90 

    glitchRef.current = setInterval(() => {
      const randomFont = GLITCH_FONTS[Math.floor(Math.random() * GLITCH_FONTS.length)]
      setCurrentFont(randomFont)
      count++
      if (count >= totalFlickers) {
        clearInterval(glitchRef.current)
      }
    }, interval)

    return () => clearInterval(glitchRef.current)
  }, [stage])

  // UPDATED: Hard-cut to final font and add gold shadow on stage 2
  useEffect(() => {
    if (stage >= 2) {
      setCurrentFont(FINAL_FONT)
      setFontSettled(true)
    }
  }, [stage])

  useEffect(() => {
    if (!showBar) return
    const t = setTimeout(() => setShowBar(false), 900)
    return () => clearTimeout(t)
  }, [showBar])

  return (
    <>
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

      <AnimatePresence>
        {showFull && (
          <motion.div
            key="preloader"
            initial={{ y: 0 }}
            animate={{ y: exiting ? "-100%" : 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            style={{
              position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
              zIndex: 9999, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", overflow: "hidden",
              background: "#0A0F1E",
            }}
          >
            <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }} />

            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "min(700px, 95vw)" }}>
              {glowActive && (
                <motion.div
                  style={{
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,76,0.25) 0%, rgba(201,168,76,0.08) 40%, transparent 70%)",
                    pointerEvents: "none", zIndex: 1,
                  }}
                  initial={{ width: 0, height: 0, opacity: 0 }}
                  animate={{ width: ["0px", "600px", "800px", "600px"], height: ["0px", "300px", "400px", "300px"], opacity: [0, 0.9, 0.5, 0.3] }}
                  transition={{ duration: 2.5, ease: "easeOut", times: [0, 0.3, 0.6, 1] }}
                />
              )}

              <motion.svg viewBox="0 0 500 250" style={{ width: "100%", position: "relative", zIndex: 2 }} initial={{ opacity: 0 }} animate={{ opacity: worldPaths.length ? 1 : 0 }} transition={{ duration: 1, delay: 0.2 }}>
                <rect width="500" height="250" fill="rgba(10,15,30,0)" />
                {worldPaths.map((d, i) => (
                  <motion.path key={i} d={d} fill="rgba(201,168,76,0.07)" stroke="rgba(201,168,76,0.5)" strokeWidth="0.3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 + i * 0.002 }} />
                ))}
              </motion.svg>
            </div>

            {/* Wordmark — Glitch transitions to Hard Cut with Gold Shadow */}
            <motion.span
              animate={{ opacity: stage >= 1 ? 1 : 0 }}
              transition={{ duration: 0 }}
              style={{
                position: "relative",
                zIndex: 20,
                color: "white",
                fontSize: "clamp(26px, 6vw, 38px)",
                fontFamily: currentFont,
                fontWeight: 600,
                textShadow: fontSettled ? "0 0 15px rgba(201,168,76,0.8)" : "none",
              }}
            >
              Nexallure
            </motion.span>

            <AnimatePresence>
              {stage >= 3 && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  style={{
                    position: "relative", zIndex: 20, marginTop: "12px",
                    fontSize: isChinese ? "13px" : "11px",
                    fontFamily: isChinese ? "'IBM Plex Sans', sans-serif" : "'IBM Plex Mono', monospace",
                    color: "rgba(255,255,255,0.5)", textAlign: "center",
                  }}
                >
                  {tagline}
                </motion.p>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {stage >= 4 && (
                <motion.button
                  onClick={dismiss}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    position: "relative", zIndex: 20, marginTop: "36px",
                    background: "#c9a84c", color: "#0A0F1E", border: "none",
                    padding: "13px 32px", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {lang === "ZH" ? "探索您的市场" : lang === "TW" ? "探索您的市場" : "Discover Your Markets"}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}