import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import AuthLayout from '@/components/AuthLayout';
import Button from '@/components/Button';
import Input from '@/components/Input';
import SocialButtons from '@/components/SocialButtons';
import { errorText } from '@/api/client';
import { useAuth } from '@/constants/authcontext';
import { colors } from '@/constants/theme';
import { emailError, passwordError } from '@/constants/validation';
import { CHEF_HOME } from '@/constants/routes';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const next = { email: emailError(email), password: passwordError(password) };
    setErrors(next);
    setServerError('');
    if (next.email || next.password) return;
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === 'chef') router.replace(CHEF_HOME);
      else router.replace(user.address ? '/home' : '/location');
    } catch (e) {
      setServerError(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Вход" subtitle="Войдите в свой аккаунт, чтобы продолжить" back={false}>
      <Input
        label="Email"
        placeholder="example@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <Input
        label="Пароль"
        placeholder="••••••••"
        password
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        onSubmitEditing={submit}
      />
      <View style={styles.row}>
        <Pressable style={styles.check} onPress={() => setRemember((v) => !v)} hitSlop={6}>
          <View style={[styles.box, remember && styles.boxOn]}>{remember && <Text style={styles.tick}>✓</Text>}</View>
          <Text style={styles.muted}>Запомнить меня</Text>
        </Pressable>
        <Link href="/forgot-password" style={styles.link}>
          Забыли пароль?
        </Link>
      </View>
      {!!serverError && <Text style={styles.serverError}>{serverError}</Text>}
      <Button title={loading ? 'Входим…' : 'Войти'} onPress={submit} disabled={loading} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Нет аккаунта?</Text>
        <Link href="/signup" style={[styles.link, styles.upper]}>
          Регистрация
        </Link>
      </View>
      <SocialButtons />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -4,
    marginBottom: 24,
  },
  check: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#E3EBF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tick: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  muted: {
    color: '#7E8A97',
    fontSize: 13,
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  upper: {
    textTransform: 'uppercase',
  },
  serverError: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 28,
  },
  footerText: {
    color: '#646982',
    fontSize: 15,
  },
});
