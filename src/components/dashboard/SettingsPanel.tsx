import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Languages, RotateCcw, Sparkles } from 'lucide-react';

export function SettingsPanel() {
  const { t, i18n } = useTranslation();

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
      className="glass-card liquid-surface control-island px-4 py-3 sm:px-5 sm:py-4"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="brand-glyph" aria-hidden="true">
            <Sparkles className="h-[18px] w-[18px]" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[17px] font-semibold tracking-[-0.025em] text-foreground sm:text-xl">
              {t('dashboard')}
            </h1>
            <p className="hidden truncate text-xs capitalize text-muted-foreground sm:block">{currentDate}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="language-control flex items-center gap-1.5">
            <Languages className="hidden h-4 w-4 text-muted-foreground sm:block" />
            <div className="segmented-control flex overflow-hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => changeLanguage('ru')}
                className={`px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3 ${
                  i18n.language === 'ru'
                    ? 'segmented-control-active text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                RU
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => changeLanguage('en')}
                className={`px-2.5 py-1.5 text-xs font-semibold transition-all sm:px-3 ${
                  i18n.language === 'en'
                    ? 'segmented-control-active text-foreground'
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
            onClick={resetData}
            className="glass-button control-button flex h-9 w-9 items-center justify-center p-0 text-muted-foreground hover:text-destructive"
            title={i18n.language === 'ru' ? 'Сбросить данные' : 'Reset data'}
          >
            <RotateCcw className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
