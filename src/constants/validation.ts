export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const emailError = (value: string) => {
  if (!value.trim()) return 'Введите email';
  if (!isEmail(value)) return 'Неверный формат email';
  return undefined;
};

export const passwordError = (value: string) => {
  if (!value) return 'Введите пароль';
  if (value.length < 6) return 'Минимум 6 символов';
  return undefined;
};
