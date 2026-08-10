// LoadingScreen.tsx
import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden" style={{ background: "var(--bg)" }}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              y: [null, -window.innerHeight * 0.2, -window.innerHeight * 0.6],
              x: [null, Math.random() * 200 - 100, Math.random() * 200 - 100],
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: "rgba(16, 185, 129, 0.3)"
            }}
          />
        ))}
      </div>

      {/* Glowing orb background */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl animate-pulse -top-20 -right-20" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)" }} />
      <div className="absolute w-96 h-96 rounded-full blur-3xl animate-pulse -bottom-20 -left-20" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)" }} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated logo / icon */}
        <motion.div
          className="relative w-24 h-24"
          animate={{
            rotate: 360,
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-b-transparent animate-spin" style={{ borderRightColor: "var(--green)", borderLeftColor: "var(--green)" }} />
          {/* Middle ring */}
          <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-b-transparent animate-spin-reverse" style={{ borderRightColor: "var(--green-2)", borderLeftColor: "var(--green-2)" }} />
          {/* Inner dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full shadow-lg animate-pulse" style={{ background: "var(--grad)", boxShadow: "0 0 20px -3px rgba(16, 185, 129, 0.5)" }} />
          </div>
        </motion.div>

        {/* Loading text with shimmer */}
        <motion.div
          className="mt-8 text-lg font-bold tracking-wider"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer" style={{ backgroundImage: "linear-gradient(90deg, var(--green-2) 0%, var(--green) 50%, var(--green-2) 100%)" }}>
            Loading your dashboard...
          </span>
        </motion.div>

        {/* Subtitle with dots animation */}
        <motion.div
          className="mt-2 text-sm text-slate-400/80 flex items-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span>Preparing your experience</span>
          <span className="inline-flex gap-1">
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            >
              .
            </motion.span>
          </span>
        </motion.div>

        {/* Progress bar (fake) */}
        <motion.div
          className="mt-6 w-48 h-1 bg-slate-700/50 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--grad)" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </div>
  );
}
