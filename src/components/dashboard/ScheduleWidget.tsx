import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Plus, Trash2, X } from 'lucide-react';

interface ScheduleEvent {
  id: number;
  time: string;
  title: string;
  date: string;
}

export function ScheduleWidget() {
  const { t, i18n } = useTranslation();
    const [events, setEvents] = useState<ScheduleEvent[]>(() => {
        const saved = localStorage.getItem('dashboard-schedule');
        return saved ? JSON.parse(saved) : [];
    });

    const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ time: '', title: '', date: 'today' });

  useEffect(() => {
    localStorage.setItem('dashboard-schedule', JSON.stringify(events));
  }, [events]);

  const addEvent = () => {
    if (!newEvent.time || !newEvent.title.trim()) return;
    
    const event: ScheduleEvent = {
      id: Date.now(),
      time: newEvent.time,
      title: newEvent.title.trim(),
      date: newEvent.date,
    };
    
    setEvents(prev => [...prev, event].sort((a, b) => {
      if (a.date === b.date) return a.time.localeCompare(b.time);
      if (a.date === 'today') return -1;
      if (b.date === 'today') return 1;
      return 0;
    }));
    setNewEvent({ time: '', title: '', date: 'today' });
    setShowAddForm(false);
  };

  const deleteEvent = (id: number) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const todayEvents = events.filter(e => e.date === 'today');
  const tomorrowEvents = events.filter(e => e.date === 'tomorrow');

  const EventItem = ({ event, isToday }: { event: ScheduleEvent; isToday: boolean }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`group flex items-center justify-between gap-3 rounded-xl p-3 transition-all ${
        isToday ? 'bg-secondary/50 hover:bg-secondary' : 'bg-secondary/30 hover:bg-secondary/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">{event.time}</span>
        </div>
        <span className={`text-sm ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
          {event.title}
        </span>
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => deleteEvent(event.id)}
        className="opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </motion.button>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="widget-icon" style={{ background: 'var(--schedule-gradient)' }}>
            <Calendar className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">{t('schedule')}</h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="glass-button flex items-center gap-1 px-3 py-1.5 text-sm text-primary"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="space-y-3 rounded-xl bg-secondary/50 p-3">
              <div className="flex gap-2">
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                  className="glass-input w-24 px-2 py-2 text-sm"
                />
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={i18n.language === 'ru' ? 'Название события...' : 'Event title...'}
                  className="glass-input flex-1 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && addEvent()}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={newEvent.date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                  className="glass-input flex-1 text-sm"
                >
                  <option value="today">{t('today')}</option>
                  <option value="tomorrow">{t('tomorrow')}</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={addEvent}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  {i18n.language === 'ru' ? 'Добавить' : 'Add'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-h-64 space-y-4 overflow-y-auto">
        <div>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">{t('today')}</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {todayEvents.length > 0 ? (
                todayEvents.map((event) => (
                  <EventItem key={event.id} event={event} isToday={true} />
                ))
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-2 text-sm text-muted-foreground"
                >
                  {t('noEvents')}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">{t('tomorrow')}</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {tomorrowEvents.length > 0 ? (
                tomorrowEvents.map((event) => (
                  <EventItem key={event.id} event={event} isToday={false} />
                ))
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-2 text-sm text-muted-foreground"
                >
                  {t('noEvents')}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
