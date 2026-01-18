import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Settings, Languages, Sun, Moon, RotateCcw } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export function SettingsPanel() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const resetData = () => {
    if (confirm(i18n.language === 'ru' 
      ? 'Сбросить все данные (заметки, расписание)?' 
      : 'Reset all data (notes, schedule)?'
    )) {
      localStorage.removeItem('dashboard-notes');
      localStorage.removeItem('dashboard-schedule');
      localStorage.removeItem('prev-currency-rates');
      window.location.reload();
    }
  };

  const currentDate = new Date().toLocaleDateString(
    i18n.language === 'ru' ? 'ru-RU' : 'en-US',
    { weekday: 'long', day: 'numeric', month: 'long' }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="widget-icon bg-gradient-to-br from-primary to-accent">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">{t('dashboard')}</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <div className="flex overflow-hidden rounded-xl bg-secondary/50">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => changeLanguage('ru')}
                className={`px-3 py-1.5 text-sm font-medium transition-all ${
                  i18n.language === 'ru'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                RU
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1.5 text-sm font-medium transition-all ${
                  i18n.language === 'en'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                EN
              </motion.button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="glass-button flex items-center gap-2 px-3 py-2"
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-4 w-4" />
                <span className="text-sm">{t('dark')}</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                <span className="text-sm">{t('light')}</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetData}
            className="glass-button flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-destructive"
            title={i18n.language === 'ru' ? 'Сбросить данные' : 'Reset data'}
          >
            <RotateCcw className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
