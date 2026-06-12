"use client"

import { useEffect, useState } from "react"
import TopLoadingBar from "./ui/TopLoadingBar"

// ─── Main Preloader Export ───────────────────────────────────────────────────
export default function Preloader({ onComplete, t }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const hasVisited = localStorage.getItem("nexallure_visited")
    if (!hasVisited) {
      // First time: show top progress bar for a bit longer
      const timer = setTimeout(() => {
        localStorage.setItem("nexallure_visited", "true")
        setLoading(false)
        onComplete?.()
      }, 2400)
      return () => clearTimeout(timer)
    } else {
      // Returning: quick clean exit
      const timer = setTimeout(() => {
        setLoading(false)
        onComplete?.()
      }, 420)
      return () => clearTimeout(timer)
    }
  }, [onComplete])

  return <TopLoadingBar isVisible={loading} />
}
