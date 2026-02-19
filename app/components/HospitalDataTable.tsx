'use client';

import { useState } from 'react';
import { HospitalFragilityMetrics } from '@/types';
import { formatNumber, formatPercent } from '@/lib/data';

interface HospitalDataTableProps {
  data: HospitalFragilityMetrics[];
  onHospitalClick?: (id: string) => void;
}

type SortKey = 'name' | 'fragilityScore' | 'totalBeds' | 'occupancyRate' | 'riskLevel';

const getRiskBadgeStyle = (level: 'low' | 'medium' | 'high' | 'critical') => {
  switch (level) {
    case 'critical': return { backgroundColor: '#7f1d1d', color: 'white' };
    case 'high': return { backgroundColor: '#ef4444', color: 'white' };
    case 'medium': return { backgroundColor: '#f97316', color: 'white' };
    case 'low': return { backgroundColor: '#22c55e', color: 'white' };
  }
};

const getFragilityBarColor = (score: number) => {
  if (score >= 0.6) return '#ef4444';
  if (score >= 0.4) return '#f97316';
  return '#22c55e';
};

export function HospitalDataTable({ data, onHospitalClick }: HospitalDataTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('fragilityScore');
  const [sortAsc, setSortAsc] = useState(false);

  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;
    switch (sortKey) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'fragilityScore':
        comparison = a.fragilityScore - b.fragilityScore;
        break;
      case 'totalBeds':
        comparison = a.totalBeds - b.totalBeds;
        break;
      case 'occupancyRate':
        comparison = a.occupancyRate - b.occupancyRate;
        break;
      case 'riskLevel':
        const riskOrder = { low: 0, medium: 1, high: 2, critical: 3 };
        comparison = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        break;
    }
    return sortAsc ? comparison : -comparison;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const SortIcon = ({ active, asc }: { active: boolean; asc: boolean }) => (
    <span className="ml-1 inline-block" style={{ color: active ? '#176B87' : '#3a4a5e' }}>
      {active && asc ? '↑' : '↓'}
    </span>
  );

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold" style={{ color: '#e0e8f0' }}>Hospital Fragility Data</h2>
        <p className="mt-1 text-sm" style={{ color: '#8899aa' }}>
          Click on any hospital to view details and locate on map
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl" style={{ border: '2px solid #2a3a4e' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#1f2b3d', borderBottom: '2px solid #2a3a4e' }}>
              <th
                className="pb-4 pt-4 pl-5 pr-4 text-left font-semibold cursor-pointer transition-colors"
                style={{ color: '#5ab0c5' }}
                onClick={() => handleSort('name')}
              >
                Hospital
                <SortIcon active={sortKey === 'name'} asc={sortAsc} />
              </th>
              <th className="pb-4 pt-4 px-4 text-left font-semibold" style={{ color: '#5ab0c5' }}>Location</th>
              <th
                className="pb-4 pt-4 px-4 text-right font-semibold cursor-pointer"
                style={{ color: '#5ab0c5' }}
                onClick={() => handleSort('fragilityScore')}
              >
                Fragility
                <SortIcon active={sortKey === 'fragilityScore'} asc={sortAsc} />
              </th>
              <th
                className="pb-4 pt-4 px-4 text-right font-semibold cursor-pointer"
                style={{ color: '#5ab0c5' }}
                onClick={() => handleSort('totalBeds')}
              >
                Beds
                <SortIcon active={sortKey === 'totalBeds'} asc={sortAsc} />
              </th>
              <th
                className="pb-4 pt-4 px-4 text-right font-semibold cursor-pointer"
                style={{ color: '#5ab0c5' }}
                onClick={() => handleSort('occupancyRate')}
              >
                Occupancy
                <SortIcon active={sortKey === 'occupancyRate'} asc={sortAsc} />
              </th>
              <th
                className="pb-4 pt-4 pl-4 pr-5 text-center font-semibold cursor-pointer"
                style={{ color: '#5ab0c5' }}
                onClick={() => handleSort('riskLevel')}
              >
                Risk
                <SortIcon active={sortKey === 'riskLevel'} asc={sortAsc} />
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#181e2a' }}>
            {sortedData.map((hospital, i) => (
              <tr
                key={hospital.id}
                onClick={() => onHospitalClick?.(hospital.id)}
                className="cursor-pointer transition-all"
                style={{
                  borderBottom: i < sortedData.length - 1 ? '1px solid #2a3a4e' : 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2b3d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181e2a'}
              >
                <td className="py-4 pl-5 pr-4">
                  <span className="font-semibold" style={{ color: '#e0e8f0' }}>{hospital.name}</span>
                </td>
                <td className="py-4 px-4">
                  <div style={{ color: '#e0e8f0' }}>{hospital.city}</div>
                  <div className="text-xs" style={{ color: '#5ab0c5' }}>Washington</div>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <div className="h-2 w-20 overflow-hidden rounded-full" style={{ backgroundColor: '#2a3a4e' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${hospital.fragilityScore * 100}%`,
                          backgroundColor: getFragilityBarColor(hospital.fragilityScore),
                        }}
                      />
                    </div>
                    <span className="w-12 text-right tabular-nums font-medium" style={{ color: '#e0e8f0' }}>
                      {formatPercent(hospital.fragilityScore)}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right tabular-nums" style={{ color: '#8899aa' }}>
                  {formatNumber(hospital.totalBeds)}
                </td>
                <td className="py-4 px-4 text-right tabular-nums" style={{ color: '#8899aa' }}>
                  {formatPercent(hospital.occupancyRate)}
                </td>
                <td className="py-4 pl-4 pr-5 text-center">
                  <span
                    className="inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize"
                    style={getRiskBadgeStyle(hospital.riskLevel)}
                  >
                    {hospital.riskLevel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
