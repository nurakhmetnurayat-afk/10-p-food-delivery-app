import type { Address } from '@/api/types';
import { colors } from '@/constants/theme';

export const LABELS = {
  home: { icon: '🏠', title: 'Дом', color: '#2790C3' },
  work: { icon: '💼', title: 'Работа', color: '#A03BB1' },
  other: { icon: '📍', title: 'Другое', color: colors.primary },
} as const;

export const fullAddress = (a: Pick<Address, 'street' | 'apartment'>) =>
  [a.street, a.apartment && `кв. ${a.apartment}`].filter(Boolean).join(', ');
