import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

// Module-level cache — computed once, reused on every mount
let cachedDots = null;
let cachedLandFeatures = null;
let preloadPromise = null;

async function preloadGlobeData() {
  if (cachedDots) return;
  if (preloadPromise) return preloadPromise;

  preloadPromise = (async () => {
    try {
      // Fetches directly from the local public folder (Fix A)
      const res = await fetch('/ne_110m_land.json');
      if (!res.ok) throw new Error('Failed to load globe data');
      const geojson = await res.json();
      
      const dots = [];
      const step = 2; // Step size for dot generation
      for (let lat = -90; lat <= 90; lat += step) {
        for (let lon = -180; lon <= 180; lon += step) {
          const point = [lon, lat];
          for (const feature of geojson.features) {
            if (d3.geoContains(feature, point)) {
              dots.push(point);
              break;
            }
          }
        }
      }
      cachedLandFeatures = geojson;
      cachedDots = dots;
    } catch (e) {
      console.error(e);
    }
  })();
  return preloadPromise;
}

// Kick off the load immediately when the module is imported (Fix B)
preloadGlobeData();

export default function WireframeDottedGlobe({ width = 800, height = 600, style = {}, canvasStyle = {} }) {
  const canvasRef = useRef(null)
  const [error, setError] = useState(null)
  const [landDots, setLandDots] = useState([])
  const rotationRef = useRef({ x: -20, y: 0 })
  const scaleRef = useRef(Math.min(width, height) / 2.2)
  const isDraggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const autoRotateRef = useRef(true)
  const rafRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const initGlobe = async () => {
      // If module data isn't ready yet, wait for it (Fix C)
      if (!cachedDots || !cachedLandFeatures) {
        await preloadGlobeData();
      }
      if (cancelled) return;
      if (cachedDots) {
        setLandDots(cachedDots);
      } else {
        setError('Failed to load globe data');
      }
    };
    initGlobe();
    
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = width
    canvas.height = height
    scaleRef.current = Math.min(width, height) / 2.2
  }, [width, height])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const render = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const projection = d3
        .geoOrthographic()
        .scale(scaleRef.current)
        .translate([w / 2, h / 2])
        .rotate([rotationRef.current.x, rotationRef.current.y])

      const path = d3.geoPath().projection(projection).context(ctx)

      // Sphere outline (Fix 1: Stroke only, no fill)
      ctx.beginPath()
      path({ type: 'Sphere' })
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Graticules
      ctx.beginPath()
      path(d3.geoGraticule()())
      ctx.strokeStyle = 'rgba(51, 51, 51, 0.5)'
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Land dots
      const center = projection.invert([w / 2, h / 2])
      for (const dot of landDots) {
        if (d3.geoDistance(dot, center) > Math.PI / 2) continue
        const [x, y] = projection(dot)
        if (x == null || y == null) continue
        ctx.beginPath()
        ctx.arc(x, y, 1.2, 0, 2 * Math.PI)
        ctx.fillStyle = '#999999'
        ctx.fill()
      }

      if (autoRotateRef.current && !isDraggingRef.current) {
        rotationRef.current.x += 0.15
      }
    }

    const tick = () => {
      render()
      rafRef.current = requestAnimationFrame(tick)
    }

    // Fix D: Render immediately without waiting for landDots
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [landDots, width, height])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const startDrag = (clientX, clientY) => {
      isDraggingRef.current = true
      autoRotateRef.current = false
      lastPosRef.current = { x: clientX, y: clientY }
    }

    const moveDrag = (clientX, clientY) => {
      if (!isDraggingRef.current) return
      const dx = clientX - lastPosRef.current.x
      const dy = clientY - lastPosRef.current.y
      rotationRef.current.x += dx * 0.3
      rotationRef.current.y -= dy * 0.3
      lastPosRef.current = { x: clientX, y: clientY }
    }

    const endDrag = () => {
      isDraggingRef.current = false
      setTimeout(() => {
        autoRotateRef.current = true
      }, 2000)
    }

    const onMouseDown = (e) => startDrag(e.clientX, e.clientY)
    const onMouseMove = (e) => moveDrag(e.clientX, e.clientY)
    const onMouseUp = () => endDrag()
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const onTouchMove = (e) => {
      if (e.touches.length === 1) {
        e.preventDefault()
        moveDrag(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const onTouchEnd = () => endDrag()

    // Removed wheel listeners (Fix 1)

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, []) // Removed width/height dependencies since zoom is removed

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          borderRadius: '16px',
          padding: '32px',
          ...style,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#cc3333', fontWeight: 600, marginBottom: '8px' }}>
            Error loading globe
          </p>
          <p style={{ color: '#999999', fontSize: '14px' }}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', ...style }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: '16px',
          backgroundColor: 'transparent',
          display: 'block',
          maxWidth: '100%',
          ...canvasStyle, // Prop passthrough (Fix 1)
        }}
      />
      {/* Label completely removed (Fix 1) */}
    </div>
  )
}