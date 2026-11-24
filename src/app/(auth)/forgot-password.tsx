import { useState } from 'react';
import { router } from 'expo-router';
import AuthLayout from '@/components/AuthLayout';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { api, errorText } from '@/api/client';
import { emailError } from '@/constants/validation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const next = emailError(email);
    setError(next);
    if (next) return;
    setLoading(true);
    try {
      const { devCode } = await api.post<{ devCode: string }>('/auth/forgot', { email: email.trim() });
      router.push({ pathname: '/verification', params: { email: email.trim(), devCode } });
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Забыли пароль?" subtitle="Укажите email, и мы отправим код для восстановления">
      <Input
        label="Email"
        placeholder="example@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        error={error}
      />
      <Button title={loading ? 'Отправляем…' : 'Отправить код'} onPress={submit} disabled={loading} style={{ marginTop: 10 }} />
    </AuthLayout>
  );
}
