export interface HospitalFragilityMetrics {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  iso3: string;

  // Fragility metrics (0-1 scale)
  fragilityScore: number;
  capacityUtilization: number;
  staffingLevel: number;
  equipmentCondition: number;
  supplyChainResilience: number;
  infrastructureAge: number;

  // Capacity
  totalBeds: number;
  icuBeds: number;
  occupancyRate: number;
  emergencyCapacity: number;

  // Risk
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  vulnerabilityIndex: number;
  disasterReadiness: number;
  lastAssessment: string;
}

export interface FragilitySummary {
  totalHospitals: number;
  averageFragilityScore: number;
  criticalHospitals: number;
  highRiskHospitals: number;
  totalBedCapacity: number;
  averageOccupancy: number;
}

export interface HospitalDetail extends HospitalFragilityMetrics {
  address: string;
  phone: string;
  type: 'general' | 'specialized' | 'teaching' | 'community';
  ownership: 'public' | 'private' | 'nonprofit';
  accreditation: string;
  yearEstablished: number;

  // Additional metrics
  staffCount: number;
  doctorCount: number;
  nurseCount: number;

  // Recent trends
  trends: {
    date: string;
    fragilityScore: number;
    occupancyRate: number;
  }[];

  // Risk factors
  riskFactors: string[];
  recommendations: string[];
}

