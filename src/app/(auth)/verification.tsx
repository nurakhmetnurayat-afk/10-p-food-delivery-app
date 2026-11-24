import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputInstance, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AuthLayout from '@/components/AuthLayout';
import Button from '@/components/Button';
import { api, errorText } from '@/api/client';
import { colors, radius } from '@/constants/theme';

const LENGTH = 4;
const RESEND_SECONDS = 50;

export default function Verification() {
  const params = useLocalSearchParams<{ email: string; devCode?: string }>();
  const email = params.email ?? '';
  const [devCode, setDevCode] = useState(params.devCode ?? '');
  const [code, setCode] = useState<string[]>(Array(LENGTH).fill(''));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [focused, setFocused] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(TextInputInstance | null)[]>([]);

  useEffect(() => {
    if (seconds === 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const change = (value: string, i: number) => {
    setError('');
    const digits = value.replace(/\D/g, '');
    const next = [...code];
    if (!digits) {
      next[i] = '';
      setCode(next);
      return;
    }
    const chars = (digits.length > 1 && code[i] ? digits.slice(1) : digits).slice(0, LENGTH - i).split('');
    chars.forEach((d, k) => {
      next[i + k] = d;
    });
    setCode(next);
    inputs.current[Math.min(i + chars.length, LENGTH - 1)]?.focus();
  };

  const backspace = (key: string, i: number) => {
    if (key === 'Backspace' && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const resend = async () => {
    try {
      const res = await api.post<{ devCode: string }>('/auth/forgot', { email });
      setDevCode(res.devCode);
      setCode(Array(LENGTH).fill(''));
      setSeconds(RESEND_SECONDS);
      inputs.current[0]?.focus();
    } catch (e) {
      setError(errorText(e));
    }
  };

  const submit = async () => {
    const value = code.join('');
    setLoading(true);
    try {
      await api.post('/auth/verify', { email, code: value });
      router.replace({ pathname: '/reset-password', params: { email, code: value } });
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  const complete = code.every(Boolean);

  return (
    <AuthLayout
      title="Подтверждение"
      subtitle={
        <>
          Мы отправили код на почту{'\n'}
          <Text style={styles.email}>{email}</Text>
        </>
      }
    >
      <View style={styles.top}>
        <Text style={styles.label}>Код</Text>
        {seconds > 0 ? (
          <Text style={styles.timer}>
            Отправить снова через <Text style={styles.bold}>{seconds} с</Text>
          </Text>
        ) : (
          <Pressable onPress={resend} hitSlop={8}>
            <Text style={styles.resend}>Отправить снова</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.cells}>
        {code.map((digit, i) => (
          <TextInput
            key={i}
            ref={(el) => {
              inputs.current[i] = el;
            }}
            value={digit}
            onChangeText={(v) => change(v, i)}
            onKeyPress={(e) => backspace(e.nativeEvent.key, i)}
            onFocus={() => setFocused(i)}
            keyboardType="number-pad"
            maxLength={LENGTH}
            autoFocus={i === 0}
            selectTextOnFocus
            style={[styles.cell, focused === i && styles.cellFocused, !!digit && styles.cellFilled, !!error && styles.cellError]}
          />
        ))}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!devCode && (
        <View style={styles.devBox}>
          <Text style={styles.devText}>
            Демо-режим: почтовый сервис не подключён, поэтому код показываем здесь — <Text style={styles.bold}>{devCode}</Text>
          </Text>
        </View>
      )}
      <Button title={loading ? 'Проверяем…' : 'Подтвердить'} onPress={submit} disabled={!complete || loading} />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  email: {
    color: colors.white,
    fontWeight: '700',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: colors.text,
    textTransform: 'uppercase',
  },
  timer: {
    fontSize: 13,
    color: colors.text,
  },
  bold: {
    fontWeight: '700',
  },
  resend: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  cells: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cell: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.field,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cellFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  cellFilled: {
    backgroundColor: colors.primarySoft,
  },
  cellError: {
    borderColor: colors.error,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 14,
  },
  devBox: {
    backgroundColor: colors.field,
    borderRadius: radius.sm,
    padding: 12,
    marginBottom: 20,
  },
  devText: {
    fontSize: 13,
    color: colors.subtle,
    lineHeight: 19,
  },
});
