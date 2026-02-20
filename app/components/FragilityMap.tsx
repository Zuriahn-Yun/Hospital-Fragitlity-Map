'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { HospitalFragilityMetrics } from '@/types';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const MapZoomController = dynamic(
  () => import('./MapZoomController').then((mod) => ({ default: mod.MapZoomController })),
  { ssr: false }
);

interface FragilityMapProps {
  data: HospitalFragilityMetrics[];
  colorBy: 'fragilityScore' | 'occupancyRate' | 'riskLevel';
  onHospitalSelect?: (id: string) => void;
  onHospitalClick?: (id: string) => void;
  zoomToHospital?: string | null;
  selectedHospitalId?: string | null;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(0);
}

function getFragilityColor(score: number): string {
  if (score >= 0.6) return '#ef4444';
  if (score >= 0.4) return '#f97316';
  return '#22c55e';
}

function getColor(hospital: HospitalFragilityMetrics, colorBy: string): string {
  if (colorBy === 'fragilityScore') {
    return getFragilityColor(hospital.fragilityScore);
  }
  if (colorBy === 'occupancyRate') {
    const rate = hospital.occupancyRate;
    if (rate >= 0.95) return '#7f1d1d';
    if (rate >= 0.9) return '#ef4444';
    if (rate >= 0.85) return '#f97316';
    if (rate >= 0.8) return '#eab308';
    return '#22c55e';
  }
  if (colorBy === 'riskLevel') {
    switch (hospital.riskLevel) {
      case 'critical': return '#7f1d1d';
      case 'high': return '#ef4444';
      case 'medium': return '#f97316';
      case 'low': return '#22c55e';
    }
  }
  return '#22c55e';
}

function getMarkerSize(beds: number): number {
  if (beds >= 500) return 16;
  if (beds >= 200) return 12;
  if (beds >= 100) return 9;
  return 7;
}

export function FragilityMap({
  data,
  colorBy,
  onHospitalSelect,
  onHospitalClick,
  zoomToHospital,
  selectedHospitalId,
}: FragilityMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const [zoomLocation, setZoomLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setMapReady(true);
  }, []);

  useEffect(() => {
    if (zoomToHospital) {
      const hospital = data.find(h => h.id === zoomToHospital);
      if (hospital) {
        setZoomLocation({ lat: hospital.latitude, lng: hospital.longitude });
      }
    }
  }, [zoomToHospital, data]);

  if (!mapReady) {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: '#1f2b3d' }}>
        <span style={{ color: '#5ab0c5' }}>Loading map...</span>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[47.3, -120.5]}
        zoom={6.5}
        minZoom={5}
        maxZoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        worldCopyJump={true}
        className="z-0"
      >
        <MapZoomController zoomToLocation={zoomLocation} />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {data.map((hospital) => (
          <CircleMarker
            key={hospital.id}
            center={[hospital.latitude, hospital.longitude]}
            radius={getMarkerSize(hospital.totalBeds)}
            pathOptions={{
              color: selectedHospitalId === hospital.id ? '#176B87' : '#86B6F6',
              weight: selectedHospitalId === hospital.id ? 3 : 2,
              fillColor: getColor(hospital, colorBy),
              fillOpacity: 0.85,
            }}
            eventHandlers={{
              click: () => {
                onHospitalClick?.(hospital.id);
              },
            }}
          >
            <Popup>
              <div style={{ minWidth: '240px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: '#e0e8f0' }}>
                  {hospital.name}
                </div>
                <div style={{ fontSize: '12px', color: '#5ab0c5', marginBottom: '14px' }}>
                  {hospital.city}, Washington
                </div>
                <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #2a3a4e' }}>
                    <span style={{ color: '#8899aa' }}>Fragility Score</span>
                    <span style={{ fontWeight: 600, color: getFragilityColor(hospital.fragilityScore) }}>
                      {(hospital.fragilityScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #2a3a4e' }}>
                    <span style={{ color: '#8899aa' }}>Total Beds</span>
                    <span style={{ fontWeight: 600, color: '#e0e8f0' }}>{formatNumber(hospital.totalBeds)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #2a3a4e' }}>
                    <span style={{ color: '#8899aa' }}>Occupancy</span>
                    <span style={{ fontWeight: 600, color: '#e0e8f0' }}>{(hospital.occupancyRate * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                    <span style={{ color: '#8899aa' }}>Risk Level</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: getColor(hospital, 'riskLevel'),
                        textTransform: 'capitalize',
                      }}
                    >
                      {hospital.riskLevel}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onHospitalSelect?.(hospital.id)}
                  style={{
                    marginTop: '14px',
                    width: '100%',
                    padding: '10px 16px',
                    background: '#176B87',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#0d5a72'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#176B87'}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div
        className="absolute bottom-6 left-6 z-[1000] rounded-xl p-5"
        style={{ backgroundColor: '#1f2b3d', border: '2px solid #2a3a4e', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}
      >
        <div className="mb-3 text-sm font-bold" style={{ color: '#5ab0c5' }}>
          {colorBy === 'fragilityScore' && 'Fragility Score'}
          {colorBy === 'occupancyRate' && 'Occupancy Rate'}
          {colorBy === 'riskLevel' && 'Risk Level'}
        </div>
        <div className="flex rounded-lg overflow-hidden">
          <div className="h-5 w-10" style={{ background: '#22c55e' }} />
          <div className="h-5 w-10" style={{ background: '#84cc16' }} />
          <div className="h-5 w-10" style={{ background: '#f97316' }} />
          <div className="h-5 w-10" style={{ background: '#ef4444' }} />
          <div className="h-5 w-10" style={{ background: '#7f1d1d' }} />
        </div>
        <div className="mt-2 flex justify-between text-xs" style={{ color: '#8899aa' }}>
          <span>Low</span>
          <span>High</span>
        </div>
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid #2a3a4e' }}>
          <div className="text-xs font-semibold mb-3" style={{ color: '#5ab0c5' }}>Marker Size = Beds</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: '#5ab0c5' }} />
              <span className="text-xs" style={{ color: '#8899aa' }}>&lt;100</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: '#5ab0c5' }} />
              <span className="text-xs" style={{ color: '#8899aa' }}>200+</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full" style={{ backgroundColor: '#5ab0c5' }} />
              <span className="text-xs" style={{ color: '#8899aa' }}>500+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
