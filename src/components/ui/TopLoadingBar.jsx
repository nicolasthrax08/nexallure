"use client"

import { motion, AnimatePresence } from "framer-motion"

/**
 * TopLoadingBar component
 * A sleek, top-of-the-screen loading progress bar.
 * @param {boolean} isVisible - Controls the visibility and animation of the bar.
 */
export default function TopLoadingBar({ isVisible }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="top-loading-bar-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-[99999] h-[3px] pointer-events-none"
          style={{ background: "rgba(201,168,76,0.1)" }}
        >
          <motion.div
            className="h-full"
            style={{
              backgroundColor: 'var(--signal-gold, #C9A84C)',
              boxShadow: '0 0 10px var(--signal-gold, #C9A84C)'
            }}
            initial={{ width: "0%" }}
            animate={{ width: "95%" }}
            transition={{
              duration: 10,
              ease: [0.1, 0.05, 0.01, 0.9],
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
