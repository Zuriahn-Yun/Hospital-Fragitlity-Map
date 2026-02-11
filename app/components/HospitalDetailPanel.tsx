'use client';

import { useEffect, useState } from 'react';
import type { HospitalDetail } from '@/types';
import { formatNumber, formatPercent } from '@/lib/data';

interface HospitalDetailPanelProps {
  hospitalId: string | null;
  onClose: () => void;
}

const getFragilityColor = (score: number): string => {
  if (score >= 0.6) return '#dc2626';
  if (score >= 0.4) return '#f97316';
  return '#22c55e';
};

const getRiskBadgeStyle = (level: string) => {
  switch (level) {
    case 'critical': return { backgroundColor: '#7f1d1d', color: 'white' };
    case 'high': return { backgroundColor: '#dc2626', color: 'white' };
    case 'medium': return { backgroundColor: '#f97316', color: 'white' };
    default: return { backgroundColor: '#22c55e', color: 'white' };
  }
};

function MetricBar({
  label,
  value,
  goodHigh = true,
}: {
  label: string;
  value: number;
  goodHigh?: boolean;
}) {
  const percentage = value * 100;
  const color = goodHigh
    ? value >= 0.8 ? '#22c55e' : value >= 0.6 ? '#f97316' : '#dc2626'
    : value >= 0.8 ? '#dc2626' : value >= 0.6 ? '#f97316' : '#22c55e';

  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: '#4a5568' }}>{label}</span>
      <div className="flex items-center gap-3">
        <div className="h-2 w-24 overflow-hidden rounded-full" style={{ backgroundColor: '#B4D4FF' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          />
        </div>
        <span className="w-12 text-right tabular-nums font-medium" style={{ color: '#1a2332' }}>
          {formatPercent(value)}
        </span>
      </div>
    </div>
  );
}

export function HospitalDetailPanel({ hospitalId, onClose }: HospitalDetailPanelProps) {
  const [detail, setDetail] = useState<HospitalDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hospitalId) {
      setDetail(null);
      return;
    }

    setLoading(true);
    fetch(`/api/hospital-detail?id=${hospitalId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [hospitalId]);

  if (!hospitalId) return null;

  return (
    <div
      className="fixed right-0 top-14 z-50 h-[calc(100vh-56px)] w-[420px] overflow-y-auto"
      style={{ backgroundColor: '#EEF5FF', borderLeft: '2px solid #86B6F6' }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-5"
        style={{ backgroundColor: '#B4D4FF', borderBottom: '2px solid #86B6F6' }}
      >
        <div className="flex items-center gap-3">
          {detail && (
            <div>
              <h2 className="font-bold text-lg" style={{ color: '#1a2332' }}>{detail.name}</h2>
              <p className="text-sm" style={{ color: '#176B87' }}>
                {detail.city}, Washington
              </p>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 transition-colors"
          style={{ backgroundColor: '#86B6F6' }}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="white"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && (
          <p className="py-12 text-center" style={{ color: '#176B87' }}>Loading...</p>
        )}

        {detail && !loading && (
          <div className="space-y-6">
            {/* Risk Badge */}
            <div className="flex items-center gap-4">
              <span
                className="rounded-full px-4 py-2 text-sm font-bold capitalize"
                style={getRiskBadgeStyle(detail.riskLevel)}
              >
                {detail.riskLevel} Risk
              </span>
              <span className="text-sm" style={{ color: '#4a5568' }}>
                Assessed: {detail.lastAssessment}
              </span>
            </div>

            {/* Key Metrics */}
            <section
              className="rounded-xl p-5"
              style={{ backgroundColor: '#B4D4FF', border: '1px solid #86B6F6' }}
            >
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#176B87' }}>
                Key Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg p-4" style={{ backgroundColor: '#EEF5FF' }}>
                  <p className="text-xs" style={{ color: '#4a5568' }}>Fragility Score</p>
                  <p
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: getFragilityColor(detail.fragilityScore) }}
                  >
                    {formatPercent(detail.fragilityScore)}
                  </p>
                </div>
                <div className="rounded-lg p-4" style={{ backgroundColor: '#EEF5FF' }}>
                  <p className="text-xs" style={{ color: '#4a5568' }}>Total Beds</p>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: '#1a2332' }}>
                    {formatNumber(detail.totalBeds)}
                  </p>
                  <p className="text-xs" style={{ color: '#176B87' }}>{detail.icuBeds} ICU</p>
                </div>
                <div className="rounded-lg p-4" style={{ backgroundColor: '#EEF5FF' }}>
                  <p className="text-xs" style={{ color: '#4a5568' }}>Occupancy Rate</p>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: '#1a2332' }}>
                    {formatPercent(detail.occupancyRate)}
                  </p>
                </div>
                <div className="rounded-lg p-4" style={{ backgroundColor: '#EEF5FF' }}>
                  <p className="text-xs" style={{ color: '#4a5568' }}>Emergency Capacity</p>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: '#1a2332' }}>
                    {detail.emergencyCapacity}
                  </p>
                </div>
              </div>
            </section>

            {/* Fragility Indicators */}
            <section
              className="rounded-xl p-5"
              style={{ backgroundColor: '#B4D4FF', border: '1px solid #86B6F6' }}
            >
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#176B87' }}>
                Fragility Indicators
              </h3>
              <div className="space-y-3">
                <MetricBar label="Staffing Level" value={detail.staffingLevel} goodHigh={true} />
                <MetricBar label="Equipment Condition" value={detail.equipmentCondition} goodHigh={true} />
                <MetricBar label="Supply Chain" value={detail.supplyChainResilience} goodHigh={true} />
                <MetricBar label="Disaster Readiness" value={detail.disasterReadiness} goodHigh={true} />
                <MetricBar label="Infrastructure Age" value={detail.infrastructureAge} goodHigh={false} />
                <MetricBar label="Capacity Utilization" value={detail.capacityUtilization} goodHigh={false} />
              </div>
            </section>

            {/* Hospital Info */}
            <section
              className="rounded-xl p-5"
              style={{ backgroundColor: '#B4D4FF', border: '1px solid #86B6F6' }}
            >
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#176B87' }}>
                Hospital Information
              </h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <span style={{ color: '#4a5568' }}>Type</span>
                <span className="capitalize font-medium" style={{ color: '#1a2332' }}>{detail.type}</span>
                <span style={{ color: '#4a5568' }}>Ownership</span>
                <span className="capitalize font-medium" style={{ color: '#1a2332' }}>{detail.ownership}</span>
                <span style={{ color: '#4a5568' }}>Established</span>
                <span className="font-medium" style={{ color: '#1a2332' }}>{detail.yearEstablished}</span>
                <span style={{ color: '#4a5568' }}>Accreditation</span>
                <span className="font-medium" style={{ color: '#1a2332' }}>{detail.accreditation}</span>
              </div>
            </section>

            {/* Staff */}
            <section
              className="rounded-xl p-5"
              style={{ backgroundColor: '#B4D4FF', border: '1px solid #86B6F6' }}
            >
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#176B87' }}>
                Staffing
              </h3>
              <div className="flex gap-4">
                <div className="flex-1 rounded-lg p-4 text-center" style={{ backgroundColor: '#EEF5FF' }}>
                  <p className="text-xl font-bold" style={{ color: '#1a2332' }}>
                    {formatNumber(detail.staffCount)}
                  </p>
                  <p className="text-xs" style={{ color: '#4a5568' }}>Total Staff</p>
                </div>
                <div className="flex-1 rounded-lg p-4 text-center" style={{ backgroundColor: '#EEF5FF' }}>
                  <p className="text-xl font-bold" style={{ color: '#1a2332' }}>
                    {formatNumber(detail.doctorCount)}
                  </p>
                  <p className="text-xs" style={{ color: '#4a5568' }}>Doctors</p>
                </div>
                <div className="flex-1 rounded-lg p-4 text-center" style={{ backgroundColor: '#EEF5FF' }}>
                  <p className="text-xl font-bold" style={{ color: '#1a2332' }}>
                    {formatNumber(detail.nurseCount)}
                  </p>
                  <p className="text-xs" style={{ color: '#4a5568' }}>Nurses</p>
                </div>
              </div>
            </section>

            {/* Risk Factors */}
            {detail.riskFactors.length > 0 && (
              <section
                className="rounded-xl p-5"
                style={{ backgroundColor: '#B4D4FF', border: '1px solid #86B6F6' }}
              >
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#176B87' }}>
                  Risk Factors
                </h3>
                <ul className="space-y-2">
                  {detail.riskFactors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span style={{ color: '#dc2626' }}>●</span>
                      <span style={{ color: '#1a2332' }}>{factor}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Recommendations */}
            {detail.recommendations.length > 0 && (
              <section
                className="rounded-xl p-5"
                style={{ backgroundColor: '#B4D4FF', border: '1px solid #86B6F6' }}
              >
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider" style={{ color: '#176B87' }}>
                  Recommendations
                </h3>
                <ul className="space-y-3">
                  {detail.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span
                        className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
                        style={{ backgroundColor: '#176B87', color: 'white' }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ color: '#1a2332' }}>{rec}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
