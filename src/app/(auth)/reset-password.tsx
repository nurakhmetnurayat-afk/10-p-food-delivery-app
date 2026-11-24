import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AuthLayout from '@/components/AuthLayout';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { api, errorText } from '@/api/client';
import type { AuthResult } from '@/api/types';
import { useAuth } from '@/constants/authcontext';
import { colors } from '@/constants/theme';
import { passwordError } from '@/constants/validation';
import { CHEF_HOME } from '@/constants/routes';

export default function ResetPassword() {
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();
  const { applySession } = useAuth();
  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [errors, setErrors] = useState<{ password?: string; repeat?: string }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const next = {
      password: passwordError(password),
      repeat: repeat === password ? undefined : 'Пароли не совпадают',
    };
    setErrors(next);
    setServerError('');
    if (next.password || next.repeat) return;
    setLoading(true);
    try {
      const user = await applySession(await api.post<AuthResult>('/auth/reset', { email, code, password }));
      router.replace(user.role === 'chef' ? CHEF_HOME : user.address ? '/home' : '/location');
    } catch (e) {
      setServerError(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Новый пароль" subtitle="Придумайте новый пароль для входа">
      <Input label="Новый пароль" placeholder="••••••••" password value={password} onChangeText={setPassword} error={errors.password} />
      <Input label="Повторите пароль" placeholder="••••••••" password value={repeat} onChangeText={setRepeat} error={errors.repeat} />
      {!!serverError && <Text style={styles.serverError}>{serverError}</Text>}
      <Button title={loading ? 'Сохраняем…' : 'Сохранить и войти'} onPress={submit} disabled={loading} style={{ marginTop: 10 }} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  serverError: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 6,
  },
});
