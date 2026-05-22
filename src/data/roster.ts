import type { CHA, Family, MicroArea, Resident } from '@/domain/models';

export interface RosterData {
  cha: CHA;
  microArea: MicroArea;
  families: Family[];
  residents: Resident[];
}

const cha: CHA = {
  id: 'CHA-001',
  name: 'Maria das Graças',
  microAreaIds: ['MA-001'],
};

const microArea: MicroArea = {
  id: 'MA-001',
  name: 'Micro-área Jardim Esperança',
  bounds: { north: -23.540, south: -23.560, east: -46.610, west: -46.640 },
  chaId: 'CHA-001',
};

const families: Family[] = [
  { id: 'FAM-001', name: 'Família Silva', microAreaId: 'MA-001', address: 'Rua das Flores, 10', coordinates: { lat: -23.541, lng: -46.612 }, residents: [] },
  { id: 'FAM-002', name: 'Família Souza', microAreaId: 'MA-001', address: 'Rua das Flores, 22', coordinates: { lat: -23.542, lng: -46.613 }, residents: [] },
  { id: 'FAM-003', name: 'Família Oliveira', microAreaId: 'MA-001', address: 'Av. Central, 5', coordinates: { lat: -23.543, lng: -46.614 }, residents: [] },
  { id: 'FAM-004', name: 'Família Santos', microAreaId: 'MA-001', address: 'Av. Central, 17', coordinates: { lat: -23.544, lng: -46.615 }, residents: [] },
  { id: 'FAM-005', name: 'Família Ferreira', microAreaId: 'MA-001', address: 'Rua Verde, 3', coordinates: { lat: -23.545, lng: -46.616 }, residents: [] },
  { id: 'FAM-006', name: 'Família Lima', microAreaId: 'MA-001', address: 'Rua Verde, 8', coordinates: { lat: -23.546, lng: -46.617 }, residents: [] },
  { id: 'FAM-007', name: 'Família Costa', microAreaId: 'MA-001', address: 'Travessa Azul, 2', coordinates: null, residents: [] },
  { id: 'FAM-008', name: 'Família Martins', microAreaId: 'MA-001', address: 'Travessa Azul, 9', coordinates: { lat: -23.548, lng: -46.619 }, residents: [] },
  { id: 'FAM-009', name: 'Família Pereira', microAreaId: 'MA-001', address: 'Rua Boa Vista, 1', coordinates: { lat: -23.549, lng: -46.620 }, residents: [] },
  { id: 'FAM-010', name: 'Família Alves', microAreaId: 'MA-001', address: 'Rua Boa Vista, 15', coordinates: { lat: -23.550, lng: -46.621 }, residents: [] },
  { id: 'FAM-011', name: 'Família Rodrigues', microAreaId: 'MA-001', address: 'Rua Sol, 4', coordinates: { lat: -23.551, lng: -46.622 }, residents: [] },
  { id: 'FAM-012', name: 'Família Carvalho', microAreaId: 'MA-001', address: 'Rua Sol, 12', coordinates: { lat: -23.552, lng: -46.623 }, residents: [] },
  { id: 'FAM-013', name: 'Família Nascimento', microAreaId: 'MA-001', address: 'Alameda Norte, 6', coordinates: { lat: -23.553, lng: -46.624 }, residents: [] },
  { id: 'FAM-014', name: 'Família Araújo', microAreaId: 'MA-001', address: 'Alameda Norte, 20', coordinates: { lat: -23.554, lng: -46.625 }, residents: [] },
  { id: 'FAM-015', name: 'Família Gomes', microAreaId: 'MA-001', address: 'Praça da Igreja, 1', coordinates: { lat: -23.555, lng: -46.626 }, residents: [] },
  { id: 'FAM-016', name: 'Família Ribeiro', microAreaId: 'MA-001', address: 'Praça da Igreja, 3', coordinates: { lat: -23.556, lng: -46.627 }, residents: [] },
  { id: 'FAM-017', name: 'Família Mendes', microAreaId: 'MA-001', address: 'Beco das Mangueiras, 2', coordinates: { lat: -23.557, lng: -46.628 }, residents: [] },
  { id: 'FAM-018', name: 'Família Dias', microAreaId: 'MA-001', address: 'Beco das Mangueiras, 5', coordinates: null, residents: [] },
  { id: 'FAM-019', name: 'Família Fernandes', microAreaId: 'MA-001', address: 'Rua do Ipê, 7', coordinates: { lat: -23.544, lng: -46.630 }, residents: [] },
  { id: 'FAM-020', name: 'Família Barros', microAreaId: 'MA-001', address: 'Rua do Ipê, 14', coordinates: { lat: -23.543, lng: -46.631 }, residents: [] },
  { id: 'FAM-021', name: 'Família Teixeira', microAreaId: 'MA-001', address: 'Rua Nova, 1', coordinates: { lat: -23.542, lng: -46.632 }, residents: [] },
  { id: 'FAM-022', name: 'Família Moreira', microAreaId: 'MA-001', address: 'Rua Nova, 9', coordinates: { lat: -23.541, lng: -46.633 }, residents: [] },
  { id: 'FAM-023', name: 'Família Nunes', microAreaId: 'MA-001', address: 'Estrada Velha, 3', coordinates: { lat: -23.540, lng: -46.634 }, residents: [] },
  { id: 'FAM-024', name: 'Família Cardoso', microAreaId: 'MA-001', address: 'Estrada Velha, 11', coordinates: { lat: -23.541, lng: -46.635 }, residents: [] },
  { id: 'FAM-025', name: 'Família Batista', microAreaId: 'MA-001', address: 'Rua Primavera, 6', coordinates: { lat: -23.542, lng: -46.636 }, residents: [] },
  { id: 'FAM-026', name: 'Família Borges', microAreaId: 'MA-001', address: 'Rua Primavera, 18', coordinates: { lat: -23.543, lng: -46.637 }, residents: [] },
  { id: 'FAM-027', name: 'Família Ramos', microAreaId: 'MA-001', address: 'Rua do Campo, 2', coordinates: { lat: -23.544, lng: -46.638 }, residents: [] },
  { id: 'FAM-028', name: 'Família Correia', microAreaId: 'MA-001', address: 'Rua do Campo, 8', coordinates: { lat: -23.545, lng: -46.639 }, residents: [] },
  { id: 'FAM-029', name: 'Família Pinto', microAreaId: 'MA-001', address: 'Viela Alegre, 1', coordinates: { lat: -23.546, lng: -46.628 }, residents: [] },
  { id: 'FAM-030', name: 'Família Azevedo', microAreaId: 'MA-001', address: 'Viela Alegre, 4', coordinates: { lat: -23.547, lng: -46.627 }, residents: [] },
];

const residents: Resident[] = [
  // FAM-001: 3 residents, 1 elderly with chronic conditions
  { id: 'RES-001-1', familyId: 'FAM-001', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-001-2', familyId: 'FAM-001', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['hypertension', 'diabetes'] },
  { id: 'RES-001-3', familyId: 'FAM-001', ageGroup: 'child', isPregnant: false, chronicConditions: [] },

  // FAM-002: 2 residents, pregnant adult
  { id: 'RES-002-1', familyId: 'FAM-002', ageGroup: 'adult', isPregnant: true, chronicConditions: [] },
  { id: 'RES-002-2', familyId: 'FAM-002', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },

  // FAM-003: 4 residents, infant + elderly with conditions
  { id: 'RES-003-1', familyId: 'FAM-003', ageGroup: 'infant', isPregnant: false, chronicConditions: [] },
  { id: 'RES-003-2', familyId: 'FAM-003', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-003-3', familyId: 'FAM-003', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-003-4', familyId: 'FAM-003', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['hypertension', 'diabetes', 'asthma'] },

  // FAM-004: 3 residents, no vulnerable groups
  { id: 'RES-004-1', familyId: 'FAM-004', ageGroup: 'adult', isPregnant: false, chronicConditions: ['hypertension'] },
  { id: 'RES-004-2', familyId: 'FAM-004', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-004-3', familyId: 'FAM-004', ageGroup: 'child', isPregnant: false, chronicConditions: [] },

  // FAM-005: 2 residents, both elderly
  { id: 'RES-005-1', familyId: 'FAM-005', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['diabetes', 'heart_disease', 'hypertension'] },
  { id: 'RES-005-2', familyId: 'FAM-005', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['arthritis'] },

  // FAM-006: 3 residents, infant + pregnant
  { id: 'RES-006-1', familyId: 'FAM-006', ageGroup: 'adult', isPregnant: true, chronicConditions: [] },
  { id: 'RES-006-2', familyId: 'FAM-006', ageGroup: 'infant', isPregnant: false, chronicConditions: [] },
  { id: 'RES-006-3', familyId: 'FAM-006', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },

  // FAM-007: 2 residents (no coordinates)
  { id: 'RES-007-1', familyId: 'FAM-007', ageGroup: 'adult', isPregnant: false, chronicConditions: ['diabetes'] },
  { id: 'RES-007-2', familyId: 'FAM-007', ageGroup: 'child', isPregnant: false, chronicConditions: [] },

  // FAM-008: 4 residents, mixed
  { id: 'RES-008-1', familyId: 'FAM-008', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['hypertension', 'diabetes', 'heart_disease', 'arthritis'] },
  { id: 'RES-008-2', familyId: 'FAM-008', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-008-3', familyId: 'FAM-008', ageGroup: 'child', isPregnant: false, chronicConditions: [] },
  { id: 'RES-008-4', familyId: 'FAM-008', ageGroup: 'infant', isPregnant: false, chronicConditions: [] },

  // FAM-009: 3 residents
  { id: 'RES-009-1', familyId: 'FAM-009', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-009-2', familyId: 'FAM-009', ageGroup: 'adult', isPregnant: false, chronicConditions: ['asthma'] },
  { id: 'RES-009-3', familyId: 'FAM-009', ageGroup: 'child', isPregnant: false, chronicConditions: [] },

  // FAM-010: 2 residents
  { id: 'RES-010-1', familyId: 'FAM-010', ageGroup: 'adult', isPregnant: true, chronicConditions: ['diabetes'] },
  { id: 'RES-010-2', familyId: 'FAM-010', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },

  // FAM-011: 3 residents
  { id: 'RES-011-1', familyId: 'FAM-011', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['hypertension'] },
  { id: 'RES-011-2', familyId: 'FAM-011', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-011-3', familyId: 'FAM-011', ageGroup: 'infant', isPregnant: false, chronicConditions: [] },

  // FAM-012: 2 residents
  { id: 'RES-012-1', familyId: 'FAM-012', ageGroup: 'adult', isPregnant: false, chronicConditions: ['hypertension', 'diabetes'] },
  { id: 'RES-012-2', familyId: 'FAM-012', ageGroup: 'child', isPregnant: false, chronicConditions: [] },

  // FAM-013: 4 residents, 2 elderly
  { id: 'RES-013-1', familyId: 'FAM-013', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['hypertension', 'diabetes'] },
  { id: 'RES-013-2', familyId: 'FAM-013', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['heart_disease'] },
  { id: 'RES-013-3', familyId: 'FAM-013', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-013-4', familyId: 'FAM-013', ageGroup: 'child', isPregnant: false, chronicConditions: [] },

  // FAM-014: 3 residents
  { id: 'RES-014-1', familyId: 'FAM-014', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-014-2', familyId: 'FAM-014', ageGroup: 'child', isPregnant: false, chronicConditions: [] },
  { id: 'RES-014-3', familyId: 'FAM-014', ageGroup: 'child', isPregnant: false, chronicConditions: [] },

  // FAM-015: 2 residents
  { id: 'RES-015-1', familyId: 'FAM-015', ageGroup: 'adult', isPregnant: false, chronicConditions: ['asthma'] },
  { id: 'RES-015-2', familyId: 'FAM-015', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },

  // FAM-016: 3 residents
  { id: 'RES-016-1', familyId: 'FAM-016', ageGroup: 'infant', isPregnant: false, chronicConditions: [] },
  { id: 'RES-016-2', familyId: 'FAM-016', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-016-3', familyId: 'FAM-016', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },

  // FAM-017: 2 residents, elderly with conditions
  { id: 'RES-017-1', familyId: 'FAM-017', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['diabetes', 'hypertension', 'arthritis', 'heart_disease'] },
  { id: 'RES-017-2', familyId: 'FAM-017', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },

  // FAM-018: 3 residents (no coordinates)
  { id: 'RES-018-1', familyId: 'FAM-018', ageGroup: 'adult', isPregnant: true, chronicConditions: [] },
  { id: 'RES-018-2', familyId: 'FAM-018', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-018-3', familyId: 'FAM-018', ageGroup: 'infant', isPregnant: false, chronicConditions: [] },

  // FAM-019: 3 residents
  { id: 'RES-019-1', familyId: 'FAM-019', ageGroup: 'adult', isPregnant: false, chronicConditions: ['hypertension'] },
  { id: 'RES-019-2', familyId: 'FAM-019', ageGroup: 'child', isPregnant: false, chronicConditions: [] },
  { id: 'RES-019-3', familyId: 'FAM-019', ageGroup: 'child', isPregnant: false, chronicConditions: [] },

  // FAM-020: 2 residents
  { id: 'RES-020-1', familyId: 'FAM-020', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-020-2', familyId: 'FAM-020', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['diabetes'] },

  // FAM-021: 4 residents
  { id: 'RES-021-1', familyId: 'FAM-021', ageGroup: 'infant', isPregnant: false, chronicConditions: [] },
  { id: 'RES-021-2', familyId: 'FAM-021', ageGroup: 'child', isPregnant: false, chronicConditions: [] },
  { id: 'RES-021-3', familyId: 'FAM-021', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-021-4', familyId: 'FAM-021', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },

  // FAM-022: 2 residents
  { id: 'RES-022-1', familyId: 'FAM-022', ageGroup: 'adult', isPregnant: false, chronicConditions: ['hypertension', 'diabetes'] },
  { id: 'RES-022-2', familyId: 'FAM-022', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },

  // FAM-023: 3 residents
  { id: 'RES-023-1', familyId: 'FAM-023', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-023-2', familyId: 'FAM-023', ageGroup: 'child', isPregnant: false, chronicConditions: [] },
  { id: 'RES-023-3', familyId: 'FAM-023', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['hypertension'] },

  // FAM-024: 2 residents
  { id: 'RES-024-1', familyId: 'FAM-024', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-024-2', familyId: 'FAM-024', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },

  // FAM-025: 3 residents
  { id: 'RES-025-1', familyId: 'FAM-025', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['diabetes', 'hypertension'] },
  { id: 'RES-025-2', familyId: 'FAM-025', ageGroup: 'child', isPregnant: false, chronicConditions: [] },
  { id: 'RES-025-3', familyId: 'FAM-025', ageGroup: 'infant', isPregnant: false, chronicConditions: [] },

  // FAM-026: 2 residents
  { id: 'RES-026-1', familyId: 'FAM-026', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-026-2', familyId: 'FAM-026', ageGroup: 'adult', isPregnant: false, chronicConditions: ['asthma'] },

  // FAM-027: 3 residents
  { id: 'RES-027-1', familyId: 'FAM-027', ageGroup: 'adult', isPregnant: true, chronicConditions: [] },
  { id: 'RES-027-2', familyId: 'FAM-027', ageGroup: 'infant', isPregnant: false, chronicConditions: [] },
  { id: 'RES-027-3', familyId: 'FAM-027', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },

  // FAM-028: 4 residents
  { id: 'RES-028-1', familyId: 'FAM-028', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['hypertension', 'heart_disease'] },
  { id: 'RES-028-2', familyId: 'FAM-028', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['diabetes'] },
  { id: 'RES-028-3', familyId: 'FAM-028', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-028-4', familyId: 'FAM-028', ageGroup: 'child', isPregnant: false, chronicConditions: [] },

  // FAM-029: 2 residents
  { id: 'RES-029-1', familyId: 'FAM-029', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-029-2', familyId: 'FAM-029', ageGroup: 'child', isPregnant: false, chronicConditions: [] },

  // FAM-030: 3 residents
  { id: 'RES-030-1', familyId: 'FAM-030', ageGroup: 'adult', isPregnant: false, chronicConditions: ['hypertension'] },
  { id: 'RES-030-2', familyId: 'FAM-030', ageGroup: 'adult', isPregnant: false, chronicConditions: [] },
  { id: 'RES-030-3', familyId: 'FAM-030', ageGroup: 'elderly', isPregnant: false, chronicConditions: ['diabetes', 'arthritis'] },
];

// Attach residents to their families
const familiesWithResidents = families.map(family => ({
  ...family,
  residents: residents.filter(r => r.familyId === family.id),
}));

export const roster: RosterData = {
  cha,
  microArea,
  families: familiesWithResidents,
  residents,
};
