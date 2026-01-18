import { motion } from 'framer-motion';

export function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, 60, 0],
          y: [0, -40, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
      />
    </div>
  );
}
