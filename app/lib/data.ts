import { HospitalFragilityMetrics, HospitalDetail, FragilitySummary } from '@/types';
import hospitalsGeoJson from '@/data/WA_Hospitals.json';

interface GeoJsonFeature {
  type: string;
  id: number;
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    OBJECTID: number;
    NAME: string;
    ADDRESS: string;
    CITY: string;
    ZIP: string;
    PHONE: string;
    ACUTE: string;
    ICU: string;
    CAH: string;
    Heli: string;
    Weblink: string;
    Beds_Total: number;
    Beds_Total_ICU: number;
    Updated: string;
    Beds_Psychiatric: number;
  };
}

interface GeoJsonData {
  type: string;
  features: GeoJsonFeature[];
}

// Calculate fragility score based on available metrics
function calculateFragilityScore(feature: GeoJsonFeature): number {
  const props = feature.properties;
  let score = 0.3; // Base score

  // Larger hospitals tend to be more resilient
  if (props.Beds_Total >= 400) score -= 0.1;
  else if (props.Beds_Total >= 200) score -= 0.05;
  else if (props.Beds_Total < 50) score += 0.1;

  // ICU capability indicates better preparedness
  if (props.ICU === 'Yes') score -= 0.05;
  if (props.Beds_Total_ICU > 30) score -= 0.05;

  // Acute care capability
  if (props.ACUTE === 'No') score += 0.15;

  // Helipad for emergency access
  if (props.Heli === 'Yes') score -= 0.03;

  // Critical Access Hospitals (rural, smaller) tend to have higher fragility
  if (props.CAH === 'Yes') score += 0.08;

  // Psychiatric-only facilities have different risk profile
  if (props.Beds_Psychiatric > 0 && props.Beds_Total === props.Beds_Psychiatric) {
    score += 0.05;
  }

  // Clamp between 0.1 and 0.8
  return Math.max(0.1, Math.min(0.8, score));
}

function getRiskLevel(fragilityScore: number): 'low' | 'medium' | 'high' | 'critical' {
  if (fragilityScore >= 0.7) return 'critical';
  if (fragilityScore >= 0.5) return 'high';
  if (fragilityScore >= 0.35) return 'medium';
  return 'low';
}

// Generate consistent pseudo-random values based on hospital ID
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

// Convert GeoJSON to HospitalFragilityMetrics
function convertToHospitalMetrics(feature: GeoJsonFeature): HospitalFragilityMetrics {
  const props = feature.properties;
  const [longitude, latitude] = feature.geometry.coordinates;
  const seed = props.OBJECTID;

  const fragilityScore = calculateFragilityScore(feature);
  const hasICU = props.ICU === 'Yes';
  const isAcute = props.ACUTE === 'Yes';

  // Generate realistic metrics based on hospital characteristics
  const baseStaffing = isAcute ? 0.75 : 0.65;
  const baseEquipment = hasICU ? 0.8 : 0.7;
  const baseSupplyChain = props.Beds_Total > 200 ? 0.8 : 0.7;

  return {
    id: `wa-${props.OBJECTID.toString().padStart(3, '0')}`,
    name: props.NAME.trim(),
    latitude,
    longitude,
    city: props.CITY,
    state: 'Washington',
    country: 'United States',
    iso3: 'USA',
    fragilityScore,
    capacityUtilization: 0.7 + seededRandom(seed * 1) * 0.25,
    staffingLevel: Math.min(0.98, baseStaffing + seededRandom(seed * 2) * 0.2),
    equipmentCondition: Math.min(0.98, baseEquipment + seededRandom(seed * 3) * 0.15),
    supplyChainResilience: Math.min(0.95, baseSupplyChain + seededRandom(seed * 4) * 0.15),
    infrastructureAge: 0.2 + seededRandom(seed * 5) * 0.4,
    totalBeds: props.Beds_Total,
    icuBeds: props.Beds_Total_ICU,
    occupancyRate: 0.65 + seededRandom(seed * 6) * 0.25,
    emergencyCapacity: Math.max(10, Math.floor(props.Beds_Total * 0.15)),
    riskLevel: getRiskLevel(fragilityScore),
    vulnerabilityIndex: fragilityScore + (seededRandom(seed * 7) * 0.1 - 0.05),
    disasterReadiness: props.Heli === 'Yes' ? 0.7 + seededRandom(seed * 8) * 0.25 : 0.5 + seededRandom(seed * 8) * 0.3,
    lastAssessment: props.Updated ? new Date(props.Updated).toISOString().split('T')[0] : '2025-05-05',
  };
}

// Parse and convert all hospitals from real GeoJSON data
const geoData = hospitalsGeoJson as unknown as GeoJsonData;
const hospitals: HospitalFragilityMetrics[] = geoData.features.map(convertToHospitalMetrics);

export function getHospitals(): HospitalFragilityMetrics[] {
  return hospitals;
}

export function getHospitalById(id: string): HospitalFragilityMetrics | undefined {
  return hospitals.find(h => h.id === id);
}

export function getHospitalsByCountry(iso3: string): HospitalFragilityMetrics[] {
  return hospitals.filter(h => h.iso3 === iso3);
}

export function getHospitalsByRiskLevel(riskLevel: 'low' | 'medium' | 'high' | 'critical'): HospitalFragilityMetrics[] {
  return hospitals.filter(h => h.riskLevel === riskLevel);
}

export function getFragilitySummary(): FragilitySummary {
  const totalHospitals = hospitals.length;
  const averageFragilityScore = hospitals.reduce((sum, h) => sum + h.fragilityScore, 0) / totalHospitals;
  const criticalHospitals = hospitals.filter(h => h.riskLevel === 'critical').length;
  const highRiskHospitals = hospitals.filter(h => h.riskLevel === 'high').length;
  const totalBedCapacity = hospitals.reduce((sum, h) => sum + h.totalBeds, 0);
  const averageOccupancy = hospitals.reduce((sum, h) => sum + h.occupancyRate, 0) / totalHospitals;

  return {
    totalHospitals,
    averageFragilityScore,
    criticalHospitals,
    highRiskHospitals,
    totalBedCapacity,
    averageOccupancy,
  };
}

// Get original feature data for additional details
function getOriginalFeature(id: string): GeoJsonFeature | undefined {
  const objectId = parseInt(id.replace('wa-', ''));
  return geoData.features.find(f => f.properties.OBJECTID === objectId);
}

export function getHospitalDetail(id: string): HospitalDetail | undefined {
  const hospital = getHospitalById(id);
  if (!hospital) return undefined;

  const feature = getOriginalFeature(id);
  const props = feature?.properties;

  const seed = parseInt(id.replace('wa-', ''));

  const detail: HospitalDetail = {
    ...hospital,
    address: props ? `${props.ADDRESS}, ${props.CITY}, WA ${props.ZIP}` : `${hospital.city}, Washington`,
    phone: props?.PHONE || '+1-360-555-0000',
    type: props?.ACUTE === 'Yes' ? (hospital.totalBeds > 300 ? 'teaching' : 'general') :
          (props?.Beds_Psychiatric && props.Beds_Psychiatric > 0 ? 'specialized' : 'community'),
    ownership: seededRandom(seed * 10) > 0.6 ? 'nonprofit' : seededRandom(seed * 11) > 0.5 ? 'public' : 'private',
    accreditation: hospital.totalBeds > 100 ? 'JCI Accredited' : 'State Licensed',
    yearEstablished: 1950 + Math.floor(seededRandom(seed * 12) * 70),
    staffCount: hospital.totalBeds * 3 + Math.floor(seededRandom(seed * 13) * 200),
    doctorCount: Math.floor(hospital.totalBeds * 0.3 + seededRandom(seed * 14) * 50),
    nurseCount: Math.floor(hospital.totalBeds * 1.5 + seededRandom(seed * 15) * 100),
    trends: [
      { date: '2025-01', fragilityScore: hospital.fragilityScore + 0.05, occupancyRate: hospital.occupancyRate - 0.03 },
      { date: '2025-02', fragilityScore: hospital.fragilityScore + 0.03, occupancyRate: hospital.occupancyRate - 0.02 },
      { date: '2025-03', fragilityScore: hospital.fragilityScore + 0.01, occupancyRate: hospital.occupancyRate },
      { date: '2025-04', fragilityScore: hospital.fragilityScore, occupancyRate: hospital.occupancyRate + 0.01 },
      { date: '2025-05', fragilityScore: hospital.fragilityScore, occupancyRate: hospital.occupancyRate },
    ],
    riskFactors: generateRiskFactors(hospital, props),
    recommendations: generateRecommendations(hospital, props),
  };

  return detail;
}

function generateRiskFactors(hospital: HospitalFragilityMetrics, props?: GeoJsonFeature['properties']): string[] {
  const factors: string[] = [];

  if (hospital.staffingLevel < 0.75) factors.push('Staffing levels below optimal');
  if (hospital.equipmentCondition < 0.7) factors.push('Equipment requires updates');
  if (hospital.supplyChainResilience < 0.7) factors.push('Supply chain vulnerability');
  if (hospital.infrastructureAge > 0.5) factors.push('Aging infrastructure');
  if (hospital.occupancyRate > 0.85) factors.push('High capacity utilization');
  if (hospital.disasterReadiness < 0.6) factors.push('Limited disaster preparedness');
  if (props?.ICU === 'No') factors.push('No ICU capability');
  if (props?.Heli === 'No') factors.push('No helipad for emergency transport');
  if (hospital.totalBeds < 50) factors.push('Limited bed capacity');

  if (factors.length === 0) factors.push('No critical risk factors identified');

  return factors.slice(0, 5);
}

function generateRecommendations(hospital: HospitalFragilityMetrics, props?: GeoJsonFeature['properties']): string[] {
  const recommendations: string[] = [];

  if (hospital.staffingLevel < 0.8) recommendations.push('Implement staff recruitment and retention programs');
  if (hospital.equipmentCondition < 0.75) recommendations.push('Prioritize medical equipment upgrades');
  if (hospital.supplyChainResilience < 0.75) recommendations.push('Diversify supply chain sources');
  if (hospital.infrastructureAge > 0.45) recommendations.push('Plan infrastructure modernization');
  if (hospital.occupancyRate > 0.8) recommendations.push('Expand bed capacity or improve patient flow');
  if (hospital.disasterReadiness < 0.7) recommendations.push('Enhance emergency preparedness training');
  if (props?.ICU === 'No' && hospital.totalBeds > 50) recommendations.push('Consider adding ICU capability');
  if (props?.Heli === 'No' && hospital.totalBeds > 100) recommendations.push('Evaluate helipad installation feasibility');

  if (recommendations.length === 0) recommendations.push('Continue current operational excellence');

  return recommendations.slice(0, 5);
}

// Utility functions
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toFixed(0);
}

export function formatPercent(num: number): string {
  return `${(num * 100).toFixed(0)}%`;
}

export function getFragilityColor(score: number): string {
  if (score >= 0.8) return '#7f1d1d'; // critical - dark red
  if (score >= 0.6) return '#dc2626'; // high - red
  if (score >= 0.4) return '#f97316'; // medium - orange
  if (score >= 0.2) return '#facc15'; // low-medium - yellow
  return '#22c55e'; // low - green
}

export function getRiskLevelColor(level: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (level) {
    case 'critical': return '#7f1d1d';
    case 'high': return '#dc2626';
    case 'medium': return '#f97316';
    case 'low': return '#22c55e';
  }
}

export function getRiskLevelBgColor(level: 'low' | 'medium' | 'high' | 'critical'): string {
  switch (level) {
    case 'critical': return 'bg-red-900 text-white';
    case 'high': return 'bg-red-500 text-white';
    case 'medium': return 'bg-orange-500 text-white';
    case 'low': return 'bg-green-500 text-white';
  }
}
