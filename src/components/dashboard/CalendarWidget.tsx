import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ru, enUS } from 'date-fns/locale';

export function CalendarWidget() {
  const { i18n } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const locale = i18n.language === 'ru' ? ru : enUS;

  const renderHeader = () => {
    return (
      <div className="mb-4 flex items-center justify-between">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>
        <h3 className="text-sm font-medium capitalize text-foreground">
          {format(currentMonth, 'LLLL yyyy', { locale })}
        </h3>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const dateFormat = 'EEEEEE';
    const startDate = startOfWeek(currentMonth, { locale });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-xs font-medium uppercase text-muted-foreground">
          {format(addDays(startDate, i), dateFormat, { locale })}
        </div>
      );
    }

    return <div className="mb-2 grid grid-cols-7 gap-1">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale });
    const endDate = endOfWeek(monthEnd, { locale });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <motion.button
            key={day.toString()}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedDate(cloneDay)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
              isSelected
                ? 'bg-primary text-primary-foreground'
                : isToday
                  ? 'bg-primary/20 text-primary'
                  : isCurrentMonth
                    ? 'text-foreground hover:bg-secondary'
                    : 'text-muted-foreground/40'
            }`}
          >
            {format(day, 'd')}
          </motion.button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="glass-card p-6"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="widget-icon bg-gradient-to-br from-emerald-500 to-teal-600">
          <CalendarDays className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {i18n.language === 'ru' ? 'Календарь' : 'Calendar'}
        </h2>
      </div>

      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </motion.div>
  );
}
