import { Group } from '../types';

export const CLINICAL_GROUPS: Group[] = [
  { id: 'healthy-relationships', name: 'Healthy Relationships', required: 16, category: 'clinical', completed: 0 },
  { id: 'rebt', name: 'REBT (Rational Emotive Behavior Therapy)', required: 24, category: 'clinical', completed: 0, note: 'Handwritten adjustment modifies "REBT" on the page' },
  { id: 'cbisa', name: 'CBISA (Cognitive Behavioral Intervention Substance Abuse)', required: 24, category: 'clinical', completed: 0 },
  { id: 'seeking-safety', name: 'Seeking Safety', required: 21, category: 'clinical', completed: 0 },
  { id: 'living-balance', name: 'Living in Balance', required: 24, category: 'clinical', completed: 0 },
  { id: 'relapse-prevention-rashida', name: 'Relapse Prevention (with Rashida)', required: 20, category: 'clinical', completed: 0 },
  { id: 'transitional-skills', name: 'Transitional Skill for Recovery', required: 16, category: 'clinical', completed: 0 },
  { id: 'spiritual-group', name: 'Spiritual Group', required: 14, category: 'clinical', completed: 0 },
  { id: 'recovery-relapse', name: 'Recovery & Relapse', required: 16, category: 'clinical', completed: 0 },
  { id: 'wellness-group', name: 'Wellness Group', required: 16, category: 'clinical', completed: 0 },
];

export const ORIENTATION_GROUPS: Group[] = [
  { id: 'orientation', name: 'Orientation Groups', required: 12, category: 'orientation', completed: 0 },
];

export const MANDATORY_GROUPS: Group[] = [
  { id: 'community-meetings', name: 'Community Meetings', required: 999, category: 'mandatory', recurring: true, completed: 0, note: 'Daily/weekly ongoing' },
  { id: 'big-book', name: 'Big Book Study', required: 999, category: 'mandatory', recurring: true, completed: 0, note: 'Ongoing study group' },
  { id: 'step-study', name: 'Step Study', required: 999, category: 'mandatory', recurring: true, completed: 0, note: 'Ongoing step work' },
];

export const AFTER_30_DAYS: Group[] = [
  { id: 'peer-support', name: 'Peer Support Group', required: 999, category: 'after30', recurring: true, completed: 0, note: 'Available after 30 days' },
  { id: 'alumni-group', name: 'Alumni Group', required: 999, category: 'after30', recurring: true, completed: 0, note: 'Available after 30 days' },
];

export const SUPPORT_GROUPS: Group[] = [
  { id: 'aa-na', name: 'AA/NA Meetings', required: 999, category: 'support', recurring: true, completed: 0, note: 'Daily/weekly meetings' },
  { id: 'smart-recovery', name: 'SMART Recovery', required: 999, category: 'support', recurring: true, completed: 0, note: 'Weekly meetings' },
  { id: 'celebrate-recovery', name: 'Celebrate Recovery', required: 999, category: 'support', recurring: true, completed: 0, note: 'Weekly meetings' },
];

export const ALL_GROUPS: Group[] = [
  ...ORIENTATION_GROUPS,
  ...CLINICAL_GROUPS,
  ...MANDATORY_GROUPS,
  ...AFTER_30_DAYS,
  ...SUPPORT_GROUPS,
];

// Return a fresh copy of all groups (shallow clone to avoid mutation)
export function getAllGroups(): Group[] {
  return ALL_GROUPS.map(g => ({ ...g }));
}
