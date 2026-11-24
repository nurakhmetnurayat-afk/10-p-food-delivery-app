import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import type { Dish, Order } from '@/api/types';
import { api, errorText } from '@/api/client';
import { EmptyState, ErrorState, FoodImage, Header, Loading, Screen, Stars } from '@/components/ui';
import { useCart } from '@/constants/cartcontext';
import { colors, money, radius } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { confirm, dateText, notify } from '@/utils/dialog';

const ACTIVE = ['accepted', 'cooking', 'on_the_way'];

export default function Orders() {
  const { data, loading, error, reload } = useApi<Order[]>('/orders', { refetchOnFocus: true, pollMs: 5000 });
  const { replaceCart, addToCart } = useCart();
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [rateFor, setRateFor] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const list = (data ?? []).filter((o) => (tab === 'active' ? ACTIVE.includes(o.status) : !ACTIVE.includes(o.status)));

  const cancel = async (order: Order) => {
    if (!(await confirm('Отменить заказ?', `Заказ №${order.number} из «${order.restaurant.name}» будет отменён.`, 'Отменить'))) return;
    try {
      await api.post(`/orders/${order.id}/cancel`);
      reload(true);
    } catch (e) {
      notify('Не получилось', errorText(e));
    }
  };

  const repeat = async (order: Order) => {
    try {
      const dishes = await Promise.all(order.items.map((i) => api.get<Dish>(`/dishes/${i.dishId}`)));
      order.items.forEach((item, idx) => {
        const dish = dishes[idx];
        const size = dish.sizes.find((s) => s.label === item.size) ?? null;
        if (idx === 0) replaceCart(dish, size, item.quantity);
        else addToCart(dish, size, item.quantity);
      });
      router.push('/cart');
    } catch (e) {
      notify('Не удалось повторить', errorText(e));
    }
  };

  const sendReview = async () => {
    if (!rateFor) return;
    try {
      await api.post(`/orders/${rateFor.id}/review`, { rating, text: comment });
      setRateFor(null);
      setComment('');
      reload(true);
      notify('Спасибо!', 'Ваш отзыв опубликован на странице ресторана');
    } catch (e) {
      notify('Ошибка', errorText(e));
    }
  };

  return (
    <Screen>
      <Header title="Мои заказы" />
      <View style={styles.tabs}>
        {(['active', 'history'] as const).map((t) => (
          <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'active' ? 'Текущие' : 'История'}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : list.length === 0 ? (
        <EmptyState
          emoji={tab === 'active' ? '🛵' : '🧾'}
          title={tab === 'active' ? 'Нет активных заказов' : 'История пуста'}
          text="Закажите что-нибудь вкусное"
          action="В меню"
          onAction={() => router.replace('/home')}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {list.map((o) => (
            <View key={o.id} style={styles.order}>
              <View style={styles.orderHead}>
                <Text style={styles.kind}>{o.items[0]?.name.split(' ')[0] ?? 'Заказ'}</Text>
                {tab === 'history' && (
                  <Text style={[styles.badge, o.status === 'cancelled' ? { color: colors.error } : { color: colors.success }]}>
                    {o.statusTitle}
                  </Text>
                )}
                {tab === 'active' && <Text style={[styles.badge, { color: colors.primary }]}>{o.statusTitle}</Text>}
              </View>
              <View style={styles.orderBody}>
                <FoodImage uri={o.restaurant.image} emoji="🍽️" style={styles.image} />
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{o.restaurant.name}</Text>
                    <Text style={styles.number}>№{o.number}</Text>
                  </View>
                  <Text style={styles.meta}>
                    <Text style={styles.sum}>{money(o.total)}</Text>  |  {dateText(o.createdAt)}  ·  {o.items.reduce((s, i) => s + i.quantity, 0)} шт.
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                {tab === 'active' ? (
                  <>
                    <Pressable style={[styles.btn, styles.btnFill]} onPress={() => router.push({ pathname: '/track/[id]', params: { id: o.id } })}>
                      <Text style={styles.btnFillText}>Отследить</Text>
                    </Pressable>
                    <Pressable style={[styles.btn, !o.canCancel && { opacity: 0.4 }]} disabled={!o.canCancel} onPress={() => cancel(o)}>
                      <Text style={styles.btnText}>Отменить</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    {o.status === 'delivered' && !o.review ? (
                      <Pressable
                        style={styles.btn}
                        onPress={() => {
                          setRating(5);
                          setRateFor(o);
                        }}
                      >
                        <Text style={styles.btnText}>Оценить</Text>
                      </Pressable>
                    ) : (
                      <View style={[styles.btn, styles.reviewed]}>
                        {o.review ? <Stars value={o.review.rating} size={14} /> : <Text style={styles.btnText}>—</Text>}
                      </View>
                    )}
                    <Pressable style={[styles.btn, styles.btnFill]} onPress={() => repeat(o)}>
                      <Text style={styles.btnFillText}>Повторить</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={!!rateFor} transparent animationType="fade" onRequestClose={() => setRateFor(null)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Как вам заказ?</Text>
            <Text style={styles.modalText}>{rateFor?.restaurant.name}</Text>
            <View style={{ alignItems: 'center', marginVertical: 18 }}>
              <Stars value={rating} onChange={setRating} size={36} />
            </View>
            <TextInput
              style={styles.modalInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Пара слов о еде и доставке"
              placeholderTextColor={colors.muted}
              multiline
            />
            <Pressable style={styles.modalBtn} onPress={sendReview}>
              <Text style={styles.btnFillText}>ОТПРАВИТЬ</Text>
            </Pressable>
            <Pressable onPress={() => setRateFor(null)} style={{ alignItems: 'center', paddingTop: 14 }}>
              <Text style={{ color: colors.muted }}>Отмена</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#CED7DF',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
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
    paddingBottom: 30,
  },
  order: {
    paddingTop: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  orderHead: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  kind: {
    fontSize: 14,
    color: colors.dark,
  },
  badge: {
    fontSize: 14,
    fontWeight: '700',
  },
  orderBody: {
    flexDirection: 'row',
    gap: 14,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark,
  },
  number: {
    fontSize: 14,
    color: '#6B6E82',
    textDecorationLine: 'underline',
  },
  meta: {
    marginTop: 6,
    fontSize: 12,
    color: '#6B6E82',
  },
  sum: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnFill: {
    backgroundColor: colors.primary,
  },
  reviewed: {
    borderColor: '#EEE',
  },
  btnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  btnFillText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18,18,35,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 22,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.dark,
    textAlign: 'center',
  },
  modalText: {
    marginTop: 4,
    color: colors.subtle,
    textAlign: 'center',
  },
  modalInput: {
    minHeight: 80,
    borderRadius: radius.sm,
    backgroundColor: colors.field,
    padding: 14,
    fontSize: 14,
    color: colors.dark,
    textAlignVertical: 'top',
  },
  modalBtn: {
    marginTop: 16,
    height: 54,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
