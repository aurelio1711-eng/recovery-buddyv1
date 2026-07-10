import type { Category } from '../types';
import { OrientationIcon, ClinicalIcon, SupportIcon } from '../components/Icons';

// Category definitions used for tab navigation and filtering throughout the app
export const CATEGORIES: Category[] = [
  { id: 'orientation', label: 'Orientation Groups', icon: OrientationIcon },
  { id: 'clinical', label: 'Clinical Groups', icon: ClinicalIcon },
  { id: 'support', label: 'Support Groups', icon: SupportIcon },
];
