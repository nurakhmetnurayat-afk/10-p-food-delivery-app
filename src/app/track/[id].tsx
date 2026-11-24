import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Order } from '@/api/types';
import CityMap from '@/components/CityMap';
import { CircleButton, ErrorState, FoodImage, Loading } from '@/components/ui';
import { colors, money } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { dateText, timeText } from '@/utils/dialog';

const RIDE_MS = 3 * 60000;

function progressOf(order: Order, now: number) {
  if (order.status === 'delivered') return 1;
  if (order.status === 'on_the_way') {
    const at = order.steps.find((s) => s.status === 'on_the_way')?.at;
    const passed = at ? (now - Date.parse(at)) / RIDE_MS : 0;
    return 0.08 + Math.min(passed, 1) * 0.88;
  }
  return 0;
}

export default function Track() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: order, loading, error, reload } = useApi<Order>(`/orders/${id}`, { pollMs: 5000, refetchOnFocus: true });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <Loading />;
  if (error || !order) return <ErrorState message={error ?? 'Заказ не найден'} onRetry={() => reload()} />;

  const live = order.status === 'on_the_way';

  return (
    <View style={styles.root}>
      <CityMap progress={progressOf(order, now)} height={420 + insets.top} />
      <View style={[styles.topBar, { top: insets.top + 12 }]}>
        <CircleButton icon="‹" dark onPress={() => (router.canGoBack() ? router.back() : router.replace('/orders'))} label="Назад" />
        <View style={styles.titlePill}>
          <Text style={styles.titleText}>Заказ №{order.number}</Text>
        </View>
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.restaurant}>
            <FoodImage uri={order.restaurant.image} emoji="🍽️" style={styles.restaurantImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.restaurantName}>{order.restaurant.name}</Text>
              <Text style={styles.small}>Заказано {dateText(order.createdAt)}</Text>
              {order.items.map((i) => (
                <Text key={i.dishId + i.size} style={styles.small}>
                  {i.quantity}× {i.name}
                </Text>
              ))}
            </View>
          </View>

          <Text style={styles.status}>{order.statusTitle}</Text>
          {order.status !== 'cancelled' && (
            <View style={styles.steps}>
              {order.steps.map((s, i) => (
                <View key={s.status} style={styles.step}>
                  <View style={styles.stepLeft}>
                    <View style={[styles.dot, s.done && styles.dotDone]} />
                    {i < order.steps.length - 1 && <View style={[styles.line, order.steps[i + 1].done && styles.lineDone]} />}
                  </View>
                  <Text style={[styles.stepText, s.done && styles.stepTextDone]}>{s.title}</Text>
                  <Text style={styles.stepTime}>{s.at ? timeText(s.at) : ''}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.courier}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 28 }}>{order.courier.avatar}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.courierName}>{order.courier.name}</Text>
              <Text style={styles.small}>{live ? 'Курьер в пути' : order.status === 'delivered' ? 'Заказ доставлен' : 'Ваш курьер'}</Text>
            </View>
            <Pressable style={styles.call} onPress={() => router.push({ pathname: '/call/[id]', params: { id: order.id } })} accessibilityLabel="Позвонить">
              <Text style={styles.callText}>✆</Text>
            </Pressable>
            <Pressable style={styles.chat} onPress={() => router.push({ pathname: '/chat/[id]', params: { id: order.id } })} accessibilityLabel="Чат">
              <Text style={styles.chatText}>✉</Text>
            </Pressable>
          </View>

          <View style={styles.sum}>
            <Text style={styles.small}>{order.address}</Text>
            <Text style={styles.sumValue}>{money(order.total)}</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F4F1',
  },
  topBar: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  titlePill: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  titleText: {
    fontWeight: '700',
    color: colors.dark,
  },
  sheet: {
    flex: 1,
    marginTop: -30,
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 60,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#C1C1C1',
    marginBottom: 16,
  },
  restaurant: {
    flexDirection: 'row',
    gap: 14,
  },
  restaurantImage: {
    width: 62,
    height: 62,
    borderRadius: 12,
  },
  restaurantName: {
    fontSize: 17,
    color: colors.dark,
    marginBottom: 2,
  },
  small: {
    fontSize: 13,
    color: colors.subtle,
    marginTop: 2,
  },
  status: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '800',
    color: colors.dark,
  },
  steps: {
    marginTop: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    minHeight: 34,
  },
  stepLeft: {
    alignItems: 'center',
    width: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#D5D8E0',
    backgroundColor: colors.white,
    marginTop: 2,
  },
  dotDone: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 18,
    backgroundColor: '#E3E6EC',
  },
  lineDone: {
    backgroundColor: colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.muted,
  },
  stepTextDone: {
    color: colors.dark,
    fontWeight: '600',
  },
  stepTime: {
    fontSize: 13,
    color: colors.muted,
  },
  courier: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFC6AE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierName: {
    fontSize: 18,
    color: colors.dark,
  },
  call: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callText: {
    color: colors.white,
    fontSize: 20,
  },
  chat: {
    width: 45,
    height: 45,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatText: {
    color: colors.primary,
    fontSize: 18,
  },
  sum: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sumValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark,
  },
});
