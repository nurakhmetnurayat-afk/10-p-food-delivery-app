import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Card } from '@/api/types';
import { api, errorText } from '@/api/client';
import Button from '@/components/Button';
import { EmptyState, ErrorState, Header, Loading, Screen } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { confirm, notify } from '@/utils/dialog';

export default function Cards() {
  const insets = useSafeAreaInsets();
  const { data, loading, error, reload } = useApi<Card[]>('/cards', { refetchOnFocus: true });

  const remove = async (c: Card) => {
    if (!(await confirm('Удалить карту?', `${c.brand} •••• ${c.last4}`, 'Удалить'))) return;
    try {
      await api.delete(`/cards/${c.id}`);
      reload(true);
    } catch (e) {
      notify('Ошибка', errorText(e));
    }
  };

  return (
    <Screen>
      <Header title="Способы оплаты" />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : !data?.length ? (
        <EmptyState emoji="💳" title="Карт пока нет" text="Можно платить наличными или добавить карту" />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {data.map((c) => (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.brand}>{c.brand}</Text>
                <Pressable onPress={() => remove(c)} hitSlop={8}>
                  <Text style={styles.remove}>Удалить</Text>
                </Pressable>
              </View>
              <Text style={styles.number}>•••• •••• •••• {c.last4}</Text>
              <Text style={styles.holder}>
                {c.holder} · {c.exp}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 20 }}>
        <Button title="Добавить карту" onPress={() => router.push('/add-card')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    backgroundColor: colors.primary,
    padding: 20,
    height: 160,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brand: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  remove: {
    color: colors.white,
    textDecorationLine: 'underline',
  },
  number: {
    color: colors.white,
    fontSize: 19,
    letterSpacing: 2,
  },
  holder: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
  },
});
