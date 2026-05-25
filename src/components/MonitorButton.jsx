import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase.js";

export function MonitorButton({ industry, region, userId }) {
  const [state, setState] = useState("idle");
  const [showModal, setShowModal] = useState(false);

  async function handleMonitor() {
    if (!userId) return;
    setShowModal(false);
    setState("loading");
    try {
      const { error } = await supabase.from("watched_markets").upsert(
        { user_id: userId, industry, region, is_active: true },
        { onConflict: "user_id,industry,region" }
      );
      setState(error ? "error" : "active");
    } catch (err) {
      console.error(err);
      setState("error");
    }
  }

  function openModal() {
    if (!userId) return;
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {state === "active" ? (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 border border-[#C9A84C]/40 text-[#C9A84C] font-mono text-xs tracking-widest"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            MONITORING
          </motion.div>
        ) : (
          <motion.button
            key="idle"
            onClick={openModal}
            disabled={state === "loading"}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-[#C9A84C]/60 text-white/70 hover:text-[#C9A84C] font-mono text-xs tracking-widest transition-colors disabled:opacity-50"
          >
            {state === "loading" ? (
              <span className="w-3 h-3 border border-[#C9A84C]/40 border-t-[#C9A84C] rounded-full animate-spin" />
            ) : (
              <span className="text-[#C9A84C]">+</span>
            )}
            {state === "loading" ? "ADDING..." : "MONITOR THIS MARKET"}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Premium Confirmation Modal ─── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(15, 17, 23, 0.85)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            <motion.div
              key="modal-card"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                background: "#141820",
                border: "1px solid rgba(201, 168, 76, 0.2)",
                borderRadius: 0,
                maxWidth: "480px",
                width: "100%",
                padding: "48px 44px 40px",
                margin: "0 20px",
              }}
            >
              {/* Close × button — absolute top-right */}
              <button
                onClick={closeModal}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.4)",
                  fontSize: "18px",
                  fontFamily: "'IBM Plex Mono', monospace",
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: "4px 6px",
                  transition: "color 150ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)")}
              >
                ×
              </button>

              {/* Modal eyebrow */}
              <div
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "10px",
                  color: "#C9A84C",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  marginBottom: "20px",
                }}
              >
                MARKET INTELLIGENCE
              </div>

              {/* Modal heading */}
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "22px",
                  color: "#F7F6F2",
                  fontWeight: 700,
                  marginBottom: "16px",
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                }}
              >
                INITIALIZE MARKET MONITOR
              </h3>

              {/* Modal description */}
              <p
                style={{
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.55)",
                  lineHeight: 1.7,
                  marginBottom: "36px",
                  maxWidth: "380px",
                }}
              >
                Flagging this asset saves this custom industry + region combo to
                your profile watchlist. Our Llama 4 Maverick engine will
                re-evaluate this market structure daily to track operational
                shifts and volatility indexes.
              </p>

              {/* Confirm Monitoring button */}
              <button
                onClick={handleMonitor}
                style={{
                  display: "block",
                  width: "100%",
                  background: "transparent",
                  border: "1px solid rgba(201, 168, 76, 0.5)",
                  borderRadius: 0,
                  color: "#C9A84C",
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  padding: "14px 0",
                  cursor: "pointer",
                  transition: "background 150ms ease, border-color 150ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(201, 168, 76, 0.08)";
                  e.currentTarget.style.borderColor = "#C9A84C";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(201, 168, 76, 0.5)";
                }}
              >
                [ CONFIRM MONITORING ]
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
