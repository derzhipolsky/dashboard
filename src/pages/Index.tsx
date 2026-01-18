import { SettingsPanel } from '@/components/dashboard/SettingsPanel';
import { BackgroundOrbs } from '@/components/dashboard/BackgroundOrbs';
import { ClockWidget } from '@/components/dashboard/ClockWidget';
import {TimerWidget} from "@/components/dashboard/TimerWidget";
import {CalendarWidget} from "@/components/dashboard/CalendarWidget";
import {WeatherWidget} from "@/components/dashboard/WeatherWidget";
import {CurrencyWidget} from "@/components/dashboard/CurrencyWidget";
import {NotesWidget} from "@/components/dashboard/NotesWidget";
import {ScheduleWidget} from "@/components/dashboard/ScheduleWidget";
import {MusicPlayer} from "@/components/dashboard/MusicPlayer";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BackgroundOrbs />
      
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <SettingsPanel />
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ClockWidget />
              <TimerWidget />
              <CalendarWidget />
              <WeatherWidget />
              <CurrencyWidget />
              <NotesWidget />
              <ScheduleWidget />
              <div className="md:col-span-2 lg:col-span-2">
                  <MusicPlayer />
              </div>
          </div>

      </div>
    </div>
  );
};

export default Index;
