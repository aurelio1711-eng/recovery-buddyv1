import { OrientationIcon, ClinicalIcon, MandatoryIcon, After30Icon, SupportIcon } from '../components/Icons';

// Category definitions used for tab navigation and filtering throughout the app
export const CATEGORIES = [
  { id: 'orientation', label: 'Orientation Groups', icon: OrientationIcon },
  { id: 'clinical', label: 'Clinical Groups', icon: ClinicalIcon },
  { id: 'mandatory', label: 'Mandatory Groups', icon: MandatoryIcon },
  { id: 'after30', label: 'After 30 Days', icon: After30Icon },
  { id: 'support', label: 'Support Groups', icon: SupportIcon },
];
