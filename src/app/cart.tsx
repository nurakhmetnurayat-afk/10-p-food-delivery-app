import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Promo, Restaurant } from '@/api/types';
import { api, errorText } from '@/api/client';
import { EmptyState, FoodImage, Header, Screen, Stepper } from '@/components/ui';
import { useAuth } from '@/constants/authcontext';
import { useCart } from '@/constants/cartcontext';
import { colors, money, radius } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { items, address, updateQuantity, removeFromCart, totalPrice, discount, promo, setPromo, restaurantId } = useCart();
  const restaurant = useApi<Restaurant>(restaurantId ? `/restaurants/${restaurantId}` : null);
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState('');
  const [code, setCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [breakdown, setBreakdown] = useState(false);

  const deliveryFee = restaurant.data?.deliveryFee ?? 0;
  const total = totalPrice + deliveryFee - discount;

  const applyPromo = async () => {
    setPromoError('');
    try {
      setPromo(await api.get<Promo>(`/promos/${encodeURIComponent(code.trim())}`));
      setCode('');
    } catch (e) {
      setPromoError(errorText(e));
    }
  };

  const checkout = () => {
    if (!user) return router.push('/login');
    if (!address.trim()) return router.push('/addresses');
    router.push({ pathname: '/payment', params: { comment } });
  };

  if (items.length === 0) {
    return (
      <Screen>
        <Header title="Корзина" />
        <EmptyState emoji="🛍️" title="Корзина пуста" text="Добавьте блюда из любимого ресторана" action="Перейти в меню" onAction={() => router.replace('/home')} />
      </Screen>
    );
  }

  return (
    <Screen dark>
      <StatusBar style="light" />
      <Header
        title="Корзина"
        light
        right={
          <Pressable onPress={() => setEditing((v) => !v)} hitSlop={8}>
            <Text style={[styles.edit, editing && { color: colors.success }]}>{editing ? 'ГОТОВО' : 'ИЗМЕНИТЬ'}</Text>
          </Pressable>
        }
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          {items.map((item) => (
            <View key={item.key} style={styles.item}>
              <FoodImage uri={item.dish.image} emoji={item.dish.emoji} style={styles.itemImage} emojiSize={40} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.dish.name}
                </Text>
                <Text style={styles.itemPrice}>{money(item.price * item.quantity)}</Text>
                <View style={styles.itemBottom}>
                  <Text style={styles.itemSize}>{item.size?.label ?? ''}</Text>
                  <Stepper value={item.quantity} onMinus={() => updateQuantity(item.key, -1)} onPlus={() => updateQuantity(item.key, 1)} />
                </View>
              </View>
              {editing && (
                <Pressable style={styles.remove} onPress={() => removeFromCart(item.key)} hitSlop={8} accessibilityLabel="Удалить">
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              )}
            </View>
          ))}

          <TextInput
            style={styles.comment}
            value={comment}
            onChangeText={setComment}
            placeholder="Комментарий курьеру: подъезд, этаж, код домофона"
            placeholderTextColor="#7C7C8A"
          />
        </ScrollView>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.sheetRow}>
            <Text style={styles.sheetLabel}>АДРЕС ДОСТАВКИ</Text>
            <Pressable onPress={() => router.push('/addresses')} hitSlop={8}>
              <Text style={styles.link}>ИЗМЕНИТЬ</Text>
            </Pressable>
          </View>
          <Pressable style={styles.address} onPress={() => router.push('/addresses')}>
            <Text style={[styles.addressText, !address && { color: colors.muted }]} numberOfLines={1}>
              {address || 'Выберите адрес доставки'}
            </Text>
          </Pressable>

          {promo ? (
            <View style={styles.promoApplied}>
              <Text style={styles.promoAppliedText}>
                🎉 {promo.code}: −{promo.percent}%
              </Text>
              <Pressable onPress={() => setPromo(null)} hitSlop={8}>
                <Text style={styles.link}>УБРАТЬ</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.promoRow}>
              <TextInput
                style={styles.promoInput}
                value={code}
                onChangeText={(v) => {
                  setCode(v);
                  setPromoError('');
                }}
                placeholder="Промокод"
                placeholderTextColor={colors.muted}
                autoCapitalize="characters"
              />
              <Pressable style={[styles.promoBtn, !code.trim() && { opacity: 0.5 }]} disabled={!code.trim()} onPress={applyPromo}>
                <Text style={styles.promoBtnText}>OK</Text>
              </Pressable>
            </View>
          )}
          {!!promoError && <Text style={styles.promoError}>{promoError}</Text>}

          {breakdown && (
            <View style={styles.breakdown}>
              <Line label="Блюда" value={money(totalPrice)} />
              <Line label="Доставка" value={deliveryFee ? money(deliveryFee) : 'Бесплатно'} />
              {discount > 0 && <Line label="Скидка" value={`−${money(discount)}`} accent />}
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>ИТОГО:</Text>
            <Text style={styles.total}>{money(total)}</Text>
            <Pressable onPress={() => setBreakdown((v) => !v)} hitSlop={8} style={{ marginLeft: 'auto' }}>
              <Text style={styles.link}>{breakdown ? 'Скрыть' : 'Подробнее'} ›</Text>
            </Pressable>
          </View>

          <Pressable style={styles.checkout} onPress={checkout}>
            <Text style={styles.checkoutText}>ОФОРМИТЬ ЗАКАЗ</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Line({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={[styles.lineValue, accent && { color: colors.success }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  edit: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 18,
  },
  itemImage: {
    width: 120,
    height: 108,
    borderRadius: 25,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    color: colors.white,
    fontSize: 17,
  },
  itemPrice: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '700',
  },
  itemBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemSize: {
    color: '#7C7C8A',
    fontSize: 15,
  },
  remove: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  comment: {
    marginTop: 24,
    borderRadius: radius.sm,
    backgroundColor: colors.darkCard,
    color: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetLabel: {
    fontSize: 13,
    color: colors.muted,
  },
  link: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  address: {
    marginTop: 10,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.field,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addressText: {
    fontSize: 15,
    color: colors.subtle,
  },
  promoRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  promoInput: {
    flex: 1,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.field,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.dark,
  },
  promoBtn: {
    width: 60,
    borderRadius: radius.sm,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBtnText: {
    color: colors.white,
    fontWeight: '700',
  },
  promoError: {
    color: colors.error,
    fontSize: 13,
    marginTop: 6,
  },
  promoApplied: {
    marginTop: 12,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoAppliedText: {
    color: colors.success,
    fontWeight: '700',
  },
  breakdown: {
    marginTop: 14,
    gap: 6,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineLabel: {
    color: colors.subtle,
    fontSize: 14,
  },
  lineValue: {
    color: colors.dark,
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
  },
  totalLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  total: {
    color: colors.dark,
    fontSize: 28,
  },
  checkout: {
    marginTop: 18,
    height: 62,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.6,
  },
});
