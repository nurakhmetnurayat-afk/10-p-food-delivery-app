import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Order, OrderStatus } from '@/api/types';
import { api, errorText } from '@/api/client';
import ChefTabBar from '@/components/ChefTabBar';
import { EmptyState, ErrorState, FoodImage, Loading, Screen } from '@/components/ui';
import { colors, money } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { confirm, notify, timeText } from '@/utils/dialog';

const TABS: { id: OrderStatus | 'all'; label: string }[] = [
  { id: 'accepted', label: 'Новые' },
  { id: 'cooking', label: 'Готовятся' },
  { id: 'all', label: 'Все' },
];

const STATUS_COLOR: Record<OrderStatus, string> = {
  accepted: colors.primary,
  cooking: '#2790C3',
  on_the_way: '#A03BB1',
  delivered: colors.success,
  cancelled: colors.error,
};

export default function ChefOrders() {
  const { data, loading, error, reload } = useApi<Order[]>('/chef/orders', { refetchOnFocus: true, pollMs: 4000 });
  const [tab, setTab] = useState<OrderStatus | 'all'>('accepted');

  const list = (data ?? []).filter((o) => tab === 'all' || o.status === tab);
  const count = (s: OrderStatus) => (data ?? []).filter((o) => o.status === s).length;

  const move = async (order: Order, status: OrderStatus) => {
    if (status === 'cancelled' && !(await confirm('Отменить заказ?', `Заказ №${order.number} для ${order.customerName}`, 'Отменить'))) return;
    try {
      await api.post(`/chef/orders/${order.id}/status`, { status });
      reload(true);
    } catch (e) {
      notify('Не получилось', errorText(e));
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Заказы</Text>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable key={t.id} style={[styles.tab, tab === t.id && styles.tabActive]} onPress={() => setTab(t.id)}>
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>
              {t.label}
              {t.id !== 'all' ? ` (${count(t.id)})` : ''}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : list.length === 0 ? (
        <EmptyState emoji="🧑‍🍳" title="Заказов нет" text="Новые заказы появятся здесь автоматически" />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {list.map((o) => (
            <View key={o.id} style={styles.order}>
              <FoodImage uri={o.items[0]?.image} emoji={o.items[0]?.emoji ?? '🍽️'} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.status, { color: STATUS_COLOR[o.status] }]}>#{o.statusTitle}</Text>
                <Text style={styles.name} numberOfLines={2}>
                  {o.items.map((i) => `${i.quantity}× ${i.name}${i.size ? ` (${i.size})` : ''}`).join(', ')}
                </Text>
                <Text style={styles.meta}>
                  №{o.number} · {o.customerName} · {timeText(o.createdAt)}
                </Text>
                {!!o.comment && <Text style={styles.comment}>💬 {o.comment}</Text>}
                <View style={styles.footer}>
                  <Text style={styles.price}>{money(o.subtotal)}</Text>
                  {o.status === 'accepted' && (
                    <View style={styles.actions}>
                      <Pressable style={[styles.btn, styles.btnFill]} onPress={() => move(o, 'cooking')}>
                        <Text style={styles.btnFillText}>Принять</Text>
                      </Pressable>
                      <Pressable style={styles.btn} onPress={() => move(o, 'cancelled')}>
                        <Text style={styles.btnText}>Отказ</Text>
                      </Pressable>
                    </View>
                  )}
                  {o.status === 'cooking' && (
                    <View style={styles.actions}>
                      <Pressable style={[styles.btn, styles.btnFill]} onPress={() => move(o, 'on_the_way')}>
                        <Text style={styles.btnFillText}>Готово</Text>
                      </Pressable>
                      <Pressable style={styles.btn} onPress={() => move(o, 'cancelled')}>
                        <Text style={styles.btnText}>Отмена</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      <ChefTabBar />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.dark,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CED7DF',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    marginBottom: -1,
  },
  tabText: {
    fontSize: 14,
    color: '#A5A7B9',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  order: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  image: {
    width: 102,
    height: 102,
    borderRadius: 20,
  },
  status: {
    fontSize: 13,
    fontWeight: '700',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark,
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  comment: {
    fontSize: 12,
    color: colors.subtle,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  btnText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '700',
  },
  btnFillText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
