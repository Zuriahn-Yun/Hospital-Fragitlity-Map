'use client';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const isOverview = activeTab === 'overview';
  const isMap = activeTab === 'map';
  const isAnalysis = activeTab === 'analysis';

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b-2 px-6" style={{ backgroundColor: '#B4D4FF', borderColor: '#86B6F6' }}>
      <div className="flex items-center gap-8">
        <button
          onClick={() => onTabChange('overview')}
          className="text-base font-bold transition-colors cursor-pointer"
          style={{ color: '#176B87' }}
        >
          WA Hospital Fragility
        </button>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('overview')}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{
              backgroundColor: isOverview ? '#176B87' : 'transparent',
              color: isOverview ? 'white' : '#176B87',
            }}
          >
            Overview
          </button>
          <button
            onClick={() => onTabChange('map')}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{
              backgroundColor: isMap ? '#176B87' : 'transparent',
              color: isMap ? 'white' : '#176B87',
            }}
          >
            Map
          </button>
          <button
            onClick={() => onTabChange('analysis')}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{
              backgroundColor: isAnalysis ? '#176B87' : 'transparent',
              color: isAnalysis ? 'white' : '#176B87',
            }}
          >
            Analysis
          </button>
        </nav>
      </div>

      <div className="flex-1" />
    </header>
  );
}
