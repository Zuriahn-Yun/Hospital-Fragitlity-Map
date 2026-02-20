'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Navbar, StatCard, HospitalDataTable, HospitalDetailPanel } from '@/components';
import type { HospitalFragilityMetrics, FragilitySummary } from '@/types';
import { formatNumber, formatPercent } from '@/lib/data';

// Dynamic import for map (client-only)
const FragilityMap = dynamic(
  () => import('@/components/FragilityMap').then((mod) => mod.FragilityMap),
  { ssr: false, loading: () => <MapLoadingPlaceholder /> }
);

function MapLoadingPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: '#1f2b3d' }}>
      <span style={{ color: '#5ab0c5' }}>Loading map...</span>
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [zoomToHospital, setZoomToHospital] = useState<string | null>(null);
  const [colorBy, setColorBy] = useState<'fragilityScore' | 'occupancyRate' | 'riskLevel'>('fragilityScore');

  // Data state
  const [hospitals, setHospitals] = useState<HospitalFragilityMetrics[]>([]);
  const [summary, setSummary] = useState<FragilitySummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [hospitalsRes, summaryRes] = await Promise.all([
          fetch('/api/hospitals'),
          fetch('/api/hospitals?type=summary'),
        ]);

        const hospitalsData = await hospitalsRes.json();
        const summaryData = await summaryRes.json();

        setHospitals(hospitalsData);
        setSummary(summaryData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleHospitalSelect = (id: string) => {
    setSelectedHospital(id);
    setZoomToHospital(id);
    if (activeTab === 'overview') {
      setActiveTab('map');
    }
  };

  const handleHospitalClick = (id: string) => {
    setZoomToHospital(id);
    setSelectedHospital(id);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#181e2a' }}>
        <div className="text-center">
          <div
            className="h-10 w-10 animate-spin rounded-full border-4 mx-auto mb-4"
            style={{ borderColor: '#2a3a4e', borderTopColor: '#176B87' }}
          />
          <p style={{ color: '#8899aa' }}>Loading hospital data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#181e2a' }}>
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className={`${selectedHospital ? 'mr-[420px]' : ''} transition-all duration-300`}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="px-8 py-8">
            {/* Summary Stats */}
            {summary && (
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6 mb-10">
                <StatCard
                  title="Total Hospitals"
                  value={summary.totalHospitals}
                />
                <StatCard
                  title="Avg Fragility"
                  value={formatPercent(summary.averageFragilityScore)}
                  subtitle="0-100% scale"
                />
                <StatCard
                  title="Critical Risk"
                  value={summary.criticalHospitals}
                  subtitle="Immediate attention"
                  trend={summary.criticalHospitals > 0 ? 'down' : 'up'}
                />
                <StatCard
                  title="High Risk"
                  value={summary.highRiskHospitals}
                  subtitle="Priority monitoring"
                  trend={summary.highRiskHospitals > 3 ? 'down' : 'neutral'}
                />
                <StatCard
                  title="Total Beds"
                  value={formatNumber(summary.totalBedCapacity)}
                  subtitle="Across all facilities"
                />
                <StatCard
                  title="Avg Occupancy"
                  value={formatPercent(summary.averageOccupancy)}
                  subtitle="Capacity utilization"
                />
              </div>
            )}

            {/* Map Preview */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold" style={{ color: '#e0e8f0' }}>Washington State Hospital Map</h2>
                <button
                  onClick={() => setActiveTab('map')}
                  className="text-sm font-semibold transition-colors"
                  style={{ color: '#5ab0c5' }}
                >
                  View Full Map →
                </button>
              </div>
              <div
                className="h-[500px] rounded-xl overflow-hidden"
                style={{ border: '2px solid #2a3a4e' }}
              >
                <FragilityMap
                  data={hospitals}
                  colorBy={colorBy}
                  onHospitalSelect={handleHospitalSelect}
                  onHospitalClick={handleHospitalClick}
                  zoomToHospital={zoomToHospital}
                  selectedHospitalId={selectedHospital}
                />
              </div>
            </div>

            {/* Data Table */}
            <HospitalDataTable
              data={hospitals}
              onHospitalClick={handleHospitalSelect}
            />
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="h-[calc(100vh-56px)] relative">
            {/* Map Controls */}
            <div className="absolute top-4 right-4 z-[1000] flex gap-2">
              <select
                value={colorBy}
                onChange={(e) => setColorBy(e.target.value as typeof colorBy)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none"
                style={{
                  backgroundColor: '#1f2b3d',
                  border: '2px solid #2a3a4e',
                  color: '#e0e8f0',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                <option value="fragilityScore">Color by Fragility</option>
                <option value="occupancyRate">Color by Occupancy</option>
                <option value="riskLevel">Color by Risk Level</option>
              </select>
            </div>

            <FragilityMap
              data={hospitals}
              colorBy={colorBy}
              onHospitalSelect={handleHospitalSelect}
              onHospitalClick={handleHospitalClick}
              zoomToHospital={zoomToHospital}
              selectedHospitalId={selectedHospital}
            />
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="px-8 py-8">
            <h2 className="text-xl font-bold mb-8" style={{ color: '#e0e8f0' }}>Hospital Fragility Analysis</h2>

            {/* Regional Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <RegionCard
                region="Seattle Metro"
                hospitals={hospitals.filter((h) =>
                  ['Seattle', 'Bellevue', 'Kirkland', 'Renton', 'Burien', 'Issaquah', 'Edmonds', 'Snoqualmie', 'Covington', 'Monroe'].includes(h.city)
                )}
              />
              <RegionCard
                region="South Puget Sound"
                hospitals={hospitals.filter((h) =>
                  ['Tacoma', 'Federal Way', 'Auburn', 'Olympia', 'Lakewood', 'Puyallup', 'Gig Harbor', 'Lacey', 'Enumclaw'].includes(h.city)
                )}
              />
              <RegionCard
                region="Eastern Washington"
                hospitals={hospitals.filter((h) =>
                  ['Spokane', 'Spokane Valley', 'Richland', 'Kennewick', 'Pasco', 'Yakima', 'Wenatchee', 'Walla Walla', 'Pullman', 'Moses Lake', 'Ellensburg', 'Sunnyside', 'Toppenish', 'Clarkston', 'Colfax', 'Medical Lake', 'Ephrata', 'Quincy', 'Othello', 'Ritzville', 'Odessa', 'Davenport', 'Dayton', 'Pomeroy', 'Colville', 'Chewelah', 'Newport', 'Republic', 'Grand Coulee', 'Chelan', 'Brewster', 'Omak', 'Tonasket', 'Leavenworth', 'Prosser', 'Goldendale', 'White Salmon'].includes(h.city)
                )}
              />
              <RegionCard
                region="Southwest Washington"
                hospitals={hospitals.filter((h) =>
                  ['Vancouver', 'Longview', 'Centralia', 'Shelton', 'Aberdeen', 'Elma', 'South Bend', 'Ilwaco', 'Morton'].includes(h.city)
                )}
              />
              <RegionCard
                region="North Sound & Peninsula"
                hospitals={hospitals.filter((h) =>
                  ['Bellingham', 'Everett', 'Bremerton', 'Silverdale', 'Port Angeles', 'Port Townsend', 'Coupeville', 'Oak Harbor', 'Anacortes', 'Mount Vernon', 'Sedro-Woolley', 'Arlington', 'Marysville', 'Friday Harbor', 'Forks'].includes(h.city)
                )}
              />
            </div>

            {/* Risk Distribution */}
            <div className="mb-10">
              <h3 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: '#5ab0c5' }}>
                Risk Level Distribution
              </h3>
              <div className="flex gap-5">
                <RiskBadge
                  level="critical"
                  count={hospitals.filter((h) => h.riskLevel === 'critical').length}
                  total={hospitals.length}
                />
                <RiskBadge
                  level="high"
                  count={hospitals.filter((h) => h.riskLevel === 'high').length}
                  total={hospitals.length}
                />
                <RiskBadge
                  level="medium"
                  count={hospitals.filter((h) => h.riskLevel === 'medium').length}
                  total={hospitals.length}
                />
                <RiskBadge
                  level="low"
                  count={hospitals.filter((h) => h.riskLevel === 'low').length}
                  total={hospitals.length}
                />
              </div>
            </div>

            {/* Hospitals Requiring Attention */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: '#5ab0c5' }}>
                Hospitals Requiring Attention
              </h3>
              <div className="space-y-4">
                {hospitals
                  .filter((h) => h.riskLevel === 'critical' || h.riskLevel === 'high' || h.riskLevel === 'medium')
                  .sort((a, b) => b.fragilityScore - a.fragilityScore)
                  .map((hospital) => (
                    <div
                      key={hospital.id}
                      onClick={() => handleHospitalSelect(hospital.id)}
                      className="flex items-center justify-between rounded-xl p-5 cursor-pointer transition-all"
                      style={{
                        backgroundColor: '#1f2b3d',
                        border: '2px solid #2a3a4e',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#176B87';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(23, 107, 135, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#2a3a4e';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div>
                        <p className="font-semibold" style={{ color: '#e0e8f0' }}>{hospital.name}</p>
                        <p className="text-sm" style={{ color: '#5ab0c5' }}>
                          {hospital.city}, Washington
                        </p>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <p className="text-sm font-semibold" style={{ color: '#e0e8f0' }}>
                            {formatPercent(hospital.fragilityScore)} fragility
                          </p>
                          <p className="text-xs" style={{ color: '#8899aa' }}>
                            {formatNumber(hospital.totalBeds)} beds
                          </p>
                        </div>
                        <span
                          className="rounded-full px-3 py-1.5 text-xs font-bold capitalize"
                          style={getRiskBadgeStyle(hospital.riskLevel)}
                        >
                          {hospital.riskLevel}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Data Source */}
      <footer className="px-8 py-6 text-center text-sm" style={{ borderTop: '1px solid #2a3a4e', color: '#8899aa' }}>
        Data source:{' '}
        <a
          href="https://geo.wa.gov/datasets/626cb2ca35c64ea1a2ac502c573e3ec9_0/about"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#5ab0c5', textDecoration: 'underline' }}
        >
          Washington State Department of Health — Hospital Data
        </a>
      </footer>

      {/* Hospital Detail Panel */}
      {selectedHospital && (
        <HospitalDetailPanel
          hospitalId={selectedHospital}
          onClose={() => setSelectedHospital(null)}
        />
      )}
    </div>
  );
}

// Helper function for risk badge styling
function getRiskBadgeStyle(level: string) {
  switch (level) {
    case 'critical': return { backgroundColor: '#7f1d1d', color: 'white' };
    case 'high': return { backgroundColor: '#ef4444', color: 'white' };
    case 'medium': return { backgroundColor: '#f97316', color: 'white' };
    default: return { backgroundColor: '#22c55e', color: 'white' };
  }
}

// Helper Components
function RegionCard({ region, hospitals }: { region: string; hospitals: HospitalFragilityMetrics[] }) {
  if (hospitals.length === 0) return null;

  const avgFragility = hospitals.reduce((sum, h) => sum + h.fragilityScore, 0) / hospitals.length;
  const avgOccupancy = hospitals.reduce((sum, h) => sum + h.occupancyRate, 0) / hospitals.length;
  const totalBeds = hospitals.reduce((sum, h) => sum + h.totalBeds, 0);

  const getFragilityColor = (score: number) => {
    if (score >= 0.6) return '#ef4444';
    if (score >= 0.4) return '#f97316';
    return '#22c55e';
  };

  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{ backgroundColor: '#1f2b3d', border: '2px solid #2a3a4e' }}
    >
      <h4 className="font-bold mb-4" style={{ color: '#e0e8f0' }}>{region}</h4>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span style={{ color: '#8899aa' }}>Hospitals</span>
          <span className="font-semibold" style={{ color: '#e0e8f0' }}>{hospitals.length}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#8899aa' }}>Avg Fragility</span>
          <span className="font-semibold" style={{ color: getFragilityColor(avgFragility) }}>
            {formatPercent(avgFragility)}
          </span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#8899aa' }}>Avg Occupancy</span>
          <span className="font-semibold" style={{ color: '#e0e8f0' }}>{formatPercent(avgOccupancy)}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#8899aa' }}>Total Beds</span>
          <span className="font-semibold" style={{ color: '#e0e8f0' }}>{formatNumber(totalBeds)}</span>
        </div>
      </div>
    </div>
  );
}

function RiskBadge({ level, count, total }: { level: string; count: number; total: number }) {
  const getBadgeStyle = () => {
    switch (level) {
      case 'critical': return { backgroundColor: '#7f1d1d', color: 'white' };
      case 'high': return { backgroundColor: '#ef4444', color: 'white' };
      case 'medium': return { backgroundColor: '#f97316', color: 'white' };
      default: return { backgroundColor: '#22c55e', color: 'white' };
    }
  };

  return (
    <div
      className="flex-1 rounded-xl p-5 text-center"
      style={{ backgroundColor: '#1f2b3d', border: '2px solid #2a3a4e' }}
    >
      <div
        className="inline-block rounded-full px-4 py-1.5 text-xs font-bold capitalize"
        style={getBadgeStyle()}
      >
        {level}
      </div>
      <p className="mt-3 text-3xl font-bold" style={{ color: '#e0e8f0' }}>{count}</p>
      <p className="text-sm" style={{ color: '#8899aa' }}>{((count / total) * 100).toFixed(0)}% of total</p>
    </div>
  );
}
