import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';

export function TimerWidget() {
  const { i18n } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [initialTime, setInitialTime] = useState(5 * 60);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            try {
              audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleiwNPpDY');
              audioRef.current.play().catch(() => {});
            } catch {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(initialTime);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
  };

  const adjustTime = (delta: number) => {
    if (isRunning) return;
    const newTime = Math.max(60, Math.min(3600, initialTime + delta));
    setInitialTime(newTime);
    setTimeLeft(newTime);
  };

  const progress = initialTime > 0 ? (timeLeft / initialTime) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="glass-card p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="widget-icon bg-gradient-to-br from-orange-500 to-red-500">
          <Timer className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {i18n.language === 'ru' ? 'Таймер' : 'Timer'}
        </h2>
      </div>

      <div className="text-center">
        <div className="relative mx-auto mb-4 h-32 w-32">
          <svg className="h-full w-full -rotate-90 transform">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-secondary"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="text-primary"
              strokeDasharray={351.86}
              strokeDashoffset={351.86 - (351.86 * progress) / 100}
              initial={false}
              animate={{ strokeDashoffset: 351.86 - (351.86 * progress) / 100 }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-light tabular-nums text-foreground">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {!isRunning && (
          <div className="mb-4 flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => adjustTime(-60)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Minus className="h-5 w-5" />
            </motion.button>
            <span className="text-sm text-muted-foreground">
              {Math.floor(initialTime / 60)} {i18n.language === 'ru' ? 'мин' : 'min'}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => adjustTime(60)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Plus className="h-5 w-5" />
            </motion.button>
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={resetTimer}
            className="rounded-xl p-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <RotateCcw className="h-5 w-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg ${
              timeLeft === 0 
                ? 'bg-green-500 text-white' 
                : isRunning 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-primary text-primary-foreground'
            }`}
          >
            {isRunning ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="ml-1 h-6 w-6" />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
