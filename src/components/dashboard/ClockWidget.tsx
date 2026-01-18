import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

export function ClockWidget() {
  const { i18n } = useTranslation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  
  const dateStr = time.toLocaleDateString(
    i18n.language === 'ru' ? 'ru-RU' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long' }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="glass-card p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="widget-icon bg-gradient-to-br from-indigo-500 to-blue-600">
          <Clock className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {i18n.language === 'ru' ? 'Часы' : 'Clock'}
        </h2>
      </div>

      <div className="text-center">
        <div className="flex items-baseline justify-center gap-1">
          <motion.span
            key={hours}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-light tabular-nums text-foreground"
          >
            {hours}
          </motion.span>
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-5xl font-light text-primary"
          >
            :
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-light tabular-nums text-foreground"
          >
            {minutes}
          </motion.span>
          <span className="ml-2 text-2xl font-light tabular-nums text-muted-foreground">
            {seconds}
          </span>
        </div>
        <p className="mt-3 text-sm capitalize text-muted-foreground">{dateStr}</p>
      </div>
    </motion.div>
  );
}
