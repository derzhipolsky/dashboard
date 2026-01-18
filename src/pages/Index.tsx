import { SettingsPanel } from '@/components/dashboard/SettingsPanel';
import { BackgroundOrbs } from '@/components/dashboard/BackgroundOrbs';

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BackgroundOrbs />
      
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <SettingsPanel />

      </div>
    </div>
  );
};

export default Index;
