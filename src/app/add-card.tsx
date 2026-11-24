import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, errorText } from '@/api/client';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { CircleButton, Screen } from '@/components/ui';
import { colors } from '@/constants/theme';

const groups = (v: string) =>
  v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

const expiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export default function AddCard() {
  const insets = useSafeAreaInsets();
  const [holder, setHolder] = useState('');
  const [number, setNumber] = useState('');
  const [exp, setExp] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/cards', { holder, number, exp, cvc });
      router.back();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <CircleButton icon="✕" onPress={() => router.back()} label="Закрыть" />
        <Text style={styles.title}>Новая карта</Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input label="Имя на карте" placeholder="ALIYA KASYMOVA" autoCapitalize="characters" value={holder} onChangeText={setHolder} />
          <Input label="Номер карты" placeholder="0000 0000 0000 0000" keyboardType="number-pad" value={number} onChangeText={(v) => setNumber(groups(v))} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Срок" placeholder="ММ/ГГ" keyboardType="number-pad" value={exp} onChangeText={(v) => setExp(expiry(v))} />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="CVC"
                placeholder="•••"
                keyboardType="number-pad"
                password
                value={cvc}
                onChangeText={(v) => setCvc(v.replace(/\D/g, '').slice(0, 3))}
              />
            </View>
          </View>
          {!!error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.note}>
            <Text style={styles.noteText}>
              Демо-режим: сервер проверяет номер по алгоритму Луна и сохраняет только последние 4 цифры. Для проверки подойдёт тестовая карта
              4242 4242 4242 4242.
            </Text>
          </View>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <Button title={loading ? 'Сохраняем…' : 'Добавить карту'} onPress={submit} disabled={loading} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  title: {
    fontSize: 17,
    color: colors.dark,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 10,
  },
  note: {
    backgroundColor: colors.field,
    borderRadius: 10,
    padding: 12,
  },
  noteText: {
    color: colors.subtle,
    fontSize: 12,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
});
