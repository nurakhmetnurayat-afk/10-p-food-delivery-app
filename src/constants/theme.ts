export const colors = {
  primary: '#FF7622',
  primaryDark: '#E9640F',
  primarySoft: '#FFF1E7',
  dark: '#121223',
  darkCard: '#1E1E2E',
  text: '#32343E',
  muted: '#A0A5BA',
  subtle: '#646982',
  field: '#F0F5FA',
  white: '#FFFFFF',
  bg: '#FFFFFF',
  border: '#E3E8EF',
  error: '#E5484D',
  success: '#059C6A',
  successSoft: '#E6F7F1',
  star: '#FFB800',
  mapRoad: '#FFE08A',
  mapLand: '#F3F5F8',
  mapPark: '#9BE3A8',
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 28,
  xl: 32,
};

export const shadow = {
  shadowColor: '#968B86',
  shadowOpacity: 0.12,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 4,
};

export const money = (value: number) => `${value.toLocaleString('ru-RU')} ₸`;
