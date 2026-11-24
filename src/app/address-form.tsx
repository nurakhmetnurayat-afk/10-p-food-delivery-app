import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Address } from '@/api/types';
import { api, errorText } from '@/api/client';
import Button from '@/components/Button';
import CityMap from '@/components/CityMap';
import Input from '@/components/Input';
import { CircleButton } from '@/components/ui';
import { useAuth } from '@/constants/authcontext';
import { useCart } from '@/constants/cartcontext';
import { colors } from '@/constants/theme';
import { fullAddress, LABELS } from '@/utils/address';

export default function AddressForm() {
  const { id, first } = useLocalSearchParams<{ id?: string; first?: string }>();
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const { setAddress } = useCart();
  const [street, setStreet] = useState('');
  const [apartment, setApartment] = useState('');
  const [comment, setComment] = useState('');
  const [label, setLabel] = useState<Address['label']>('home');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get<Address[]>('/addresses')
      .then((list) => {
        const a = list.find((x) => x.id === id);
        if (!a) return;
        setStreet(a.street);
        setApartment(a.apartment);
        setComment(a.comment);
        setLabel(a.label);
      })
      .catch((e) => setError(errorText(e)));
  }, [id]);

  const save = async () => {
    setError('');
    if (!street.trim()) return setError('Укажите улицу и дом');
    setLoading(true);
    try {
      const body = { street, apartment, comment, label };
      const saved = id
        ? await api.patch<Address>(`/addresses/${id}`, body)
        : await api.post<Address>('/addresses', body);
      setAddress(fullAddress(saved));
      if (user && !user.address) await updateProfile({ address: saved.street });
      if (first || !router.canGoBack()) router.replace('/home');
      else router.back();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <CityMap progress={0} height={260 + insets.top} pinOnly />
      <View style={[styles.back, { top: insets.top + 12 }]}>
        <CircleButton icon="‹" dark onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} label="Назад" />
      </View>
      <KeyboardAvoidingView style={styles.sheet} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{id ? 'Изменить адрес' : 'Новый адрес'}</Text>
          <Input label="Улица и дом" value={street} onChangeText={setStreet} placeholder="пр. Абая, 44" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Квартира / офис" value={apartment} onChangeText={setApartment} placeholder="12" />
            </View>
          </View>
          <Input label="Комментарий" value={comment} onChangeText={setComment} placeholder="Подъезд 2, домофон 12" />
          <Text style={styles.label}>МЕТКА</Text>
          <View style={styles.labels}>
            {(Object.keys(LABELS) as Address['label'][]).map((key) => (
              <Pressable key={key} style={[styles.tag, label === key && styles.tagActive]} onPress={() => setLabel(key)}>
                <Text style={[styles.tagText, label === key && { color: colors.white, fontWeight: '700' }]}>
                  {LABELS[key].icon} {LABELS[key].title}
                </Text>
              </Pressable>
            ))}
          </View>
          {!!error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>
        <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 20 }}>
          <Button title={loading ? 'Сохраняем…' : 'Сохранить адрес'} onPress={save} disabled={loading} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  back: {
    position: 'absolute',
    left: 24,
  },
  sheet: {
    flex: 1,
    marginTop: -24,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  label: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 10,
  },
  labels: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#F0F5FA',
  },
  tagActive: {
    backgroundColor: colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: colors.dark,
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginTop: 14,
  },
});
