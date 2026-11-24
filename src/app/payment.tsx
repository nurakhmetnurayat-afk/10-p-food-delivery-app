import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Card, Order, Restaurant } from '@/api/types';
import { api, errorText } from '@/api/client';
import { Header, Screen } from '@/components/ui';
import { useCart } from '@/constants/cartcontext';
import { colors, money, radius } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { notify } from '@/utils/dialog';

type Method = 'cash' | string;

export default function Payment() {
  const { comment } = useLocalSearchParams<{ comment?: string }>();
  const insets = useSafeAreaInsets();
  const { items, address, promo, totalPrice, discount, restaurantId, clearCart } = useCart();
  const cards = useApi<Card[]>('/cards', { refetchOnFocus: true });
  const restaurant = useApi<Restaurant>(restaurantId ? `/restaurants/${restaurantId}` : null);
  const [picked, setMethod] = useState<Method | null>(null);
  const [loading, setLoading] = useState(false);

  const newest = cards.data?.[cards.data.length - 1]?.id;
  const valid = picked === 'cash' || !!cards.data?.some((c) => c.id === picked);
  const method: Method = picked && valid ? picked : (newest ?? 'cash');

  const total = totalPrice + (restaurant.data?.deliveryFee ?? 0) - discount;
  const selectedCard = cards.data?.find((c) => c.id === method);

  const pay = async () => {
    setLoading(true);
    try {
      const order = await api.post<Order>('/orders', {
        items: items.map((i) => ({ dishId: i.dish.id, sizeId: i.size?.id, quantity: i.quantity })),
        address,
        comment,
        payment: method === 'cash' ? 'cash' : 'card',
        cardId: method === 'cash' ? undefined : method,
        promoCode: promo?.code,
      });
      clearCart();
      router.replace({ pathname: '/success', params: { id: order.id } });
    } catch (e) {
      notify('Не удалось оформить заказ', errorText(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <Header title="Оплата" />
      <ScrollView contentContainerStyle={styles.content}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.methods}>
          <MethodTile icon="💵" label="Наличные" active={method === 'cash'} onPress={() => setMethod('cash')} />
          {cards.data?.map((c) => (
            <MethodTile
              key={c.id}
              icon={c.brand === 'Visa' ? 'VISA' : c.brand === 'Mastercard' ? '◐◑' : '💳'}
              label={`•• ${c.last4}`}
              active={method === c.id}
              onPress={() => setMethod(c.id)}
            />
          ))}
          <MethodTile icon="＋" label="Карта" active={false} onPress={() => router.push('/add-card')} />
        </ScrollView>

        {method === 'cash' ? (
          <View style={styles.cashBox}>
            <Text style={styles.cashEmoji}>💵</Text>
            <Text style={styles.cashTitle}>Оплата наличными</Text>
            <Text style={styles.cashText}>Отдайте деньги курьеру при получении заказа</Text>
          </View>
        ) : selectedCard ? (
          <View style={styles.cardRow}>
            <Text style={styles.cardBrand}>{selectedCard.brand}</Text>
            <Text style={styles.cardNumber}>•••• •••• •••• {selectedCard.last4}</Text>
            <Text style={styles.cardHolder}>
              {selectedCard.holder} · {selectedCard.exp}
            </Text>
          </View>
        ) : null}

        <Pressable style={styles.addNew} onPress={() => router.push('/add-card')}>
          <Text style={styles.addNewText}>＋ ДОБАВИТЬ КАРТУ</Text>
        </Pressable>

        <Text style={styles.demo}>Учебный проект: оплата демонстрационная, деньги не списываются.</Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>ИТОГО:</Text>
          <Text style={styles.total}>{money(total)}</Text>
        </View>
        <Pressable style={[styles.pay, (loading || !items.length) && { opacity: 0.6 }]} disabled={loading || !items.length} onPress={pay}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.payText}>ОПЛАТИТЬ И ПОДТВЕРДИТЬ</Text>}
        </Pressable>
      </View>
    </Screen>
  );
}

function MethodTile({ icon, label, active, onPress }: { icon: string; label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.tileWrap}>
      <View style={[styles.tile, active && styles.tileActive]}>
        <Text style={[styles.tileIcon, icon.length > 2 && styles.tileIconText]}>{icon}</Text>
        {active && (
          <View style={styles.tick}>
            <Text style={styles.tickText}>✓</Text>
          </View>
        )}
      </View>
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  methods: {
    gap: 14,
    paddingTop: 10,
    paddingRight: 24,
  },
  tileWrap: {
    alignItems: 'center',
  },
  tile: {
    width: 85,
    height: 72,
    borderRadius: radius.sm,
    backgroundColor: '#F0F5FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tileActive: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  tileIcon: {
    fontSize: 26,
  },
  tileIconText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1F71',
  },
  tick: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  tickText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  tileLabel: {
    marginTop: 8,
    fontSize: 14,
    color: colors.subtle,
  },
  cashBox: {
    marginTop: 24,
    borderRadius: radius.sm,
    backgroundColor: colors.field,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  cashEmoji: {
    fontSize: 54,
  },
  cashTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark,
  },
  cashText: {
    marginTop: 6,
    fontSize: 14,
    color: colors.subtle,
    textAlign: 'center',
  },
  cardRow: {
    marginTop: 24,
    borderRadius: 20,
    backgroundColor: colors.primary,
    padding: 22,
    height: 170,
    justifyContent: 'space-between',
  },
  cardBrand: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  cardNumber: {
    color: colors.white,
    fontSize: 20,
    letterSpacing: 2,
  },
  cardHolder: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
  },
  addNew: {
    marginTop: 16,
    height: 62,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: '#F0F5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  demo: {
    marginTop: 14,
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  totalLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  total: {
    fontSize: 30,
    color: colors.dark,
  },
  pay: {
    marginTop: 16,
    height: 62,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.6,
  },
});
