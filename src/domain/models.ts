export type ISODateString = string;

export type AgeGroup = 'infant' | 'child' | 'adult' | 'elderly';

export type FollowUpFlag = string;

export type RiskFactorKey =
  | 'time_since_visit'
  | 'chronic_conditions'
  | 'vulnerable_groups'
  | 'follow_up';

export interface RiskFactor {
  key: RiskFactorKey;
  value: number;
  weight: number;
  contribution: number;
  labelKey: string;
  labelValues?: Record<string, number | string>;
}

export interface RiskScore {
  total: number;
  factors: RiskFactor[];
}

export interface Resident {
  id: string;
  familyId: string;
  ageGroup: AgeGroup;
  isPregnant: boolean;
  chronicConditions: string[];
}

export interface Family {
  id: string;
  name: string;
  microAreaId: string;
  address: string | null;
  coordinates: { lat: number; lng: number } | null;
  residents: Resident[];
}

export interface Visit {
  id: string;
  familyId: string;
  chaId: string;
  visitDate: ISODateString;
  notes: string;
  followUpFlags: FollowUpFlag[];
  registeredAt: string;
  undone: boolean;
}

export interface ScoringWeights {
  timeSinceVisit: number;
  chronicConditions: number;
  vulnerableGroups: number;
  followUp: number;
}

export interface ScoringConstants {
  neverVisitedCap: number;
  chronicCap: number;
}

export interface ScoringConfig {
  weights: ScoringWeights;
  constants: ScoringConstants;
  recommendedIntervalDays: number;
}

export interface ScoredFamily {
  family: Family;
  activeVisits: Visit[];
  score: RiskScore;
  daysSinceLastVisit: number;
  lastVisitDate: ISODateString | null;
  followUpRequired: boolean;
}

export interface MicroArea {
  id: string;
  name: string;
  bounds: { north: number; south: number; east: number; west: number };
  chaId: string;
}

export interface CHA {
  id: string;
  name: string;
  microAreaIds: string[];
}
