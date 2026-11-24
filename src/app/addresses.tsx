import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Address } from '@/api/types';
import { api, errorText } from '@/api/client';
import Button from '@/components/Button';
import { EmptyState, ErrorState, Header, Loading, Screen } from '@/components/ui';
import { useCart } from '@/constants/cartcontext';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { fullAddress, LABELS } from '@/utils/address';
import { confirm, notify } from '@/utils/dialog';

export default function Addresses() {
  const insets = useSafeAreaInsets();
  const { address: current, setAddress } = useCart();
  const { data, loading, error, reload } = useApi<Address[]>('/addresses', { refetchOnFocus: true });

  const choose = (a: Address) => {
    setAddress(fullAddress(a));
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  };

  const remove = async (a: Address) => {
    if (!(await confirm('Удалить адрес?', fullAddress(a), 'Удалить'))) return;
    try {
      await api.delete(`/addresses/${a.id}`);
      reload(true);
    } catch (e) {
      notify('Ошибка', errorText(e));
    }
  };

  return (
    <Screen>
      <Header title="Мои адреса" />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : !data?.length ? (
        <EmptyState emoji="🗺️" title="Адресов пока нет" text="Добавьте адрес, чтобы курьер знал, куда ехать" />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          <Text style={styles.hint}>Нажмите на адрес, чтобы доставить заказ туда</Text>
          {data.map((a) => {
            const label = LABELS[a.label];
            const selected = current === fullAddress(a);
            return (
              <Pressable key={a.id} style={[styles.card, selected && styles.cardSelected]} onPress={() => choose(a)}>
                <View style={styles.icon}>
                  <Text style={{ fontSize: 20 }}>{label.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{label.title.toUpperCase()}</Text>
                  <Text style={styles.street}>{fullAddress(a)}</Text>
                  {!!a.comment && <Text style={styles.comment}>{a.comment}</Text>}
                </View>
                <Pressable hitSlop={8} onPress={() => router.push({ pathname: '/address-form', params: { id: a.id } })} accessibilityLabel="Изменить">
                  <Text style={styles.action}>✎</Text>
                </Pressable>
                <Pressable hitSlop={8} onPress={() => remove(a)} accessibilityLabel="Удалить">
                  <Text style={styles.action}>🗑</Text>
                </Pressable>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 20 }}>
        <Button title="Добавить новый адрес" onPress={() => router.push('/address-form')} />
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
  hint: {
    fontSize: 13,
    color: colors.muted,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F0F5FA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark,
  },
  street: {
    marginTop: 4,
    fontSize: 14,
    color: colors.text,
  },
  comment: {
    marginTop: 2,
    fontSize: 12,
    color: colors.muted,
  },
  action: {
    fontSize: 18,
    color: colors.primary,
  },
});
