import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Clock3, Plus, Trash2, X } from 'lucide-react';

type EventDay = 'today' | 'tomorrow';

interface ScheduleEvent {
  id: number;
  time: string;
  title: string;
  date: EventDay;
}

const emptyEvent: Omit<ScheduleEvent, 'id'> = { time: '', title: '', date: 'today' };

function readSavedEvents(): ScheduleEvent[] {
  try {
    const saved = localStorage.getItem('dashboard-schedule');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

interface EventItemProps {
  event: ScheduleEvent;
  muted?: boolean;
  deleteLabel: string;
  onDelete: (id: number) => void;
}

function EventItem({ event, muted, deleteLabel, onDelete }: EventItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, x: 16 }}
      className={`inner-glass schedule-event group ${muted ? 'schedule-event-muted' : ''}`}
    >
      <time className="schedule-time" dateTime={event.time}>{event.time}</time>
      <span className="schedule-dot" aria-hidden="true" />
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{event.title}</p>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onDelete(event.id)}
        className="schedule-delete"
        aria-label={`${deleteLabel} ${event.title}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </motion.button>
    </motion.div>
  );
}

interface EventGroupProps {
  dayLabel: string;
  emptyLabel: string;
  deleteLabel: string;
  items: ScheduleEvent[];
  muted?: boolean;
  onDelete: (id: number) => void;
}

function EventGroup({ dayLabel, emptyLabel, deleteLabel, items, muted, onDelete }: EventGroupProps) {
  return (
    <section className="schedule-group">
      <div className="mb-2.5 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{dayLabel}</h3>
        <span className="event-count">{items.length}</span>
      </div>
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {items.length ? items.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              muted={muted}
              deleteLabel={deleteLabel}
              onDelete={onDelete}
            />
          )) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inner-glass schedule-empty">
              <Clock3 className="h-4 w-4" />
              <span>{emptyLabel}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export function ScheduleWidget() {
  const { t, i18n } = useTranslation();
  const isRussian = i18n.language === 'ru';
  const [events, setEvents] = useState<ScheduleEvent[]>(readSavedEvents);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState(emptyEvent);

  useEffect(() => {
    localStorage.setItem('dashboard-schedule', JSON.stringify(events));
  }, [events]);

  const addEvent = () => {
    if (!newEvent.time || !newEvent.title.trim()) return;

    setEvents((previous) => [
      ...previous,
      { ...newEvent, id: Date.now(), title: newEvent.title.trim() },
    ].sort((a, b) => {
      if (a.date === b.date) return a.time.localeCompare(b.time);
      return a.date === 'today' ? -1 : 1;
    }));
    setNewEvent(emptyEvent);
    setShowAddForm(false);
  };

  const deleteEvent = (id: number) => {
    setEvents((previous) => previous.filter((event) => event.id !== id));
  };

  const todayEvents = events.filter((event) => event.date === 'today');
  const tomorrowEvents = events.filter((event) => event.date === 'tomorrow');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card liquid-surface dashboard-card accent-violet h-full p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="widget-icon">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em] text-foreground">{t('schedule')}</h2>
            <p className="text-xs text-muted-foreground">
              {events.length
                ? `${events.length} ${isRussian ? 'в планах' : events.length === 1 ? 'item planned' : 'items planned'}`
                : isRussian ? 'Свободный день' : 'A clear day'}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm((visible) => !visible)}
          className={`schedule-add ${showAddForm ? 'schedule-add-active' : ''}`}
          aria-label={showAddForm ? (isRussian ? 'Закрыть' : 'Close') : t('addEvent')}
          aria-expanded={showAddForm}
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            className="mb-5 overflow-hidden"
            onSubmit={(event) => { event.preventDefault(); addEvent(); }}
          >
            <div className="inner-glass schedule-form">
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="schedule-time">{isRussian ? 'Время' : 'Time'}</label>
                <input
                  id="schedule-time"
                  type="time"
                  value={newEvent.time}
                  onChange={(event) => setNewEvent((previous) => ({ ...previous, time: event.target.value }))}
                  className="glass-input sm:w-[116px]"
                  required
                />
                <label className="sr-only" htmlFor="schedule-title">{t('eventTitle')}</label>
                <input
                  id="schedule-title"
                  type="text"
                  value={newEvent.title}
                  onChange={(event) => setNewEvent((previous) => ({ ...previous, title: event.target.value }))}
                  placeholder={isRussian ? 'Что запланировано?' : 'What is planned?'}
                  className="glass-input min-w-0 flex-1"
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-2">
                <label className="sr-only" htmlFor="schedule-day">{isRussian ? 'День' : 'Day'}</label>
                <select
                  id="schedule-day"
                  value={newEvent.date}
                  onChange={(event) => setNewEvent((previous) => ({ ...previous, date: event.target.value as EventDay }))}
                  className="glass-input flex-1"
                >
                  <option value="today">{t('today')}</option>
                  <option value="tomorrow">{t('tomorrow')}</option>
                </select>
                <motion.button whileTap={{ scale: 0.97 }} type="submit" className="liquid-primary px-4 text-sm font-semibold">
                  {isRussian ? 'Готово' : 'Done'}
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="schedule-list space-y-5 overflow-y-auto pr-1">
        <EventGroup
          dayLabel={t('today')}
          emptyLabel={t('noEvents')}
          deleteLabel={isRussian ? 'Удалить' : 'Delete'}
          items={todayEvents}
          onDelete={deleteEvent}
        />
        <EventGroup
          dayLabel={t('tomorrow')}
          emptyLabel={t('noEvents')}
          deleteLabel={isRussian ? 'Удалить' : 'Delete'}
          items={tomorrowEvents}
          muted
          onDelete={deleteEvent}
        />
      </div>
    </motion.div>
  );
}
