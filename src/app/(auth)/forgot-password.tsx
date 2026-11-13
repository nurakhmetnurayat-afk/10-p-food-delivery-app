import { useState } from 'react';
import { router } from 'expo-router';
import AuthLayout from '@/components/AuthLayout';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { emailError } from '@/constants/validation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();

  const submit = () => {
    const next = emailError(email);
    setError(next);
    if (!next) router.push({ pathname: '/verification', params: { email: email.trim() } });
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
      <Button title="Отправить код" onPress={submit} style={{ marginTop: 10 }} />
    </AuthLayout>
  );
}
