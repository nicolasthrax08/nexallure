import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import TopLoadingBar from "./ui/TopLoadingBar";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
    }
  },
  exit: { opacity: 0, transition: { duration: 0.3 } }
};

export default function MarketLoader({ text = "Analyzing export markets..." }) {
  return createPortal(
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100vw",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <TopLoadingBar isVisible={true} />

      <motion.div
        style={{
          position: "fixed",
          top: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10000,
          background: "rgba(10, 15, 30, 0.8)",
          padding: "4px 12px",
          border: "1px solid rgba(201, 168, 76, 0.2)",
          backdropFilter: "blur(4px)",
        }}
      >
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "10px",
          color: "rgba(240,230,204,0.9)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          margin: 0,
        }}>
          {text}
        </p>
      </motion.div>
    </motion.div>,
    document.body
  );
}
