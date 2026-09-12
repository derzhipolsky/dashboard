import { SettingsPanel } from '@/components/dashboard/SettingsPanel';
import { LiquidGlassFilter } from '@/components/dashboard/LiquidGlassFilter';
import { ClockWidget } from '@/components/dashboard/ClockWidget';
import { TimerWidget } from '@/components/dashboard/TimerWidget';
import { CalendarWidget } from '@/components/dashboard/CalendarWidget';
import { WeatherWidget } from '@/components/dashboard/WeatherWidget';
import { CurrencyWidget } from '@/components/dashboard/CurrencyWidget';
import { NotesWidget } from '@/components/dashboard/NotesWidget';
import { ScheduleWidget } from '@/components/dashboard/ScheduleWidget';
import { MusicPlayer } from '@/components/dashboard/MusicPlayer';

const Index = () => {
  return (
    <main className="dashboard-shell relative min-h-screen overflow-x-clip bg-background">
      <LiquidGlassFilter />

      <div className="dashboard-content relative mx-auto max-w-[1440px] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <SettingsPanel />
        <section className="dashboard-grid mt-4 sm:mt-5" aria-label="Dashboard widgets">
          <div className="tile-clock"><ClockWidget /></div>
          <div className="tile-timer"><TimerWidget /></div>
          <div className="tile-calendar"><CalendarWidget /></div>
          <div className="tile-weather"><WeatherWidget /></div>
          <div className="tile-currency"><CurrencyWidget /></div>
          <div className="tile-notes"><NotesWidget /></div>
          <div className="tile-schedule"><ScheduleWidget /></div>
          <div className="tile-music"><MusicPlayer /></div>
        </section>
      </div>
    </main>
  );
};

export default Index;
