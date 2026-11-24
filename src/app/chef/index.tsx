import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ChefDashboard } from '@/api/types';
import ChefTabBar from '@/components/ChefTabBar';
import { ErrorState, FoodImage, Loading, Screen, SectionTitle } from '@/components/ui';
import { useAuth } from '@/constants/authcontext';
import { colors, money, shadow } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';

const DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export default function ChefHome() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useApi<ChefDashboard>('/chef/dashboard', { refetchOnFocus: true, pollMs: 8000 });

  const max = Math.max(1, ...(data?.days.map((d) => d.revenue) ?? [1]));

  return (
    <Screen>
      <StatusBar style="dark" />
      {loading ? (
        <Loading />
      ) : error || !data ? (
        <ErrorState message={error ?? 'Нет данных'} onRetry={() => reload()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.top}>
            <View style={{ flex: 1 }}>
              <Text style={styles.location}>РЕСТОРАН</Text>
              <Text style={styles.name}>{data.restaurant.name} ▾</Text>
            </View>
            <Pressable onPress={() => router.replace('/chef/profile')}>
              <FoodImage uri={data.restaurant.image} emoji="👨‍🍳" style={styles.avatar} />
            </Pressable>
          </View>

          <View style={styles.stats}>
            <Pressable style={styles.stat} onPress={() => router.replace('/chef/orders')}>
              <Text style={styles.statValue}>{String(data.running).padStart(2, '0')}</Text>
              <Text style={styles.statLabel}>ГОТОВЯТСЯ</Text>
            </Pressable>
            <Pressable style={styles.stat} onPress={() => router.replace('/chef/orders')}>
              <Text style={styles.statValue}>{String(data.requests).padStart(2, '0')}</Text>
              <Text style={styles.statLabel}>НОВЫЕ ЗАКАЗЫ</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View>
                <Text style={styles.cardLabel}>Выручка за 7 дней</Text>
                <Text style={styles.revenue}>{money(data.revenueTotal)}</Text>
              </View>
              <Text style={styles.link}>Баланс: {money(data.balance)}</Text>
            </View>
            <View style={styles.chart}>
              {data.days.map((d) => (
                <View key={d.day} style={styles.barWrap}>
                  <View style={styles.barTrack}>
                    <View style={[styles.bar, { height: `${Math.max(4, (d.revenue / max) * 100)}%` }, d.revenue === max && d.revenue > 0 && styles.barTop]} />
                  </View>
                  <Text style={styles.barLabel}>{DAYS[new Date(d.day).getDay()]}</Text>
                </View>
              ))}
            </View>
          </View>

          <Pressable style={styles.card} onPress={() => router.push('/chef/reviews')}>
            <View style={styles.cardHead}>
              <Text style={styles.cardLabel}>Отзывы</Text>
              <Text style={styles.link}>Все отзывы</Text>
            </View>
            <Text style={styles.rating}>
              <Text style={{ color: colors.primary }}>★ {data.rating}</Text>
              <Text style={styles.ratingText}>   Отзывов из приложения: {data.reviewsCount}</Text>
            </Text>
          </Pressable>

          <SectionTitle title="Популярное за неделю" action="Меню" onAction={() => router.replace('/chef/menu')} />
          {data.popular.length === 0 ? (
            <Text style={styles.empty}>Пока нет продаж — как только клиенты сделают заказ, здесь появятся хиты.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {data.popular.map((p) => (
                <View key={p.id} style={styles.popular}>
                  <FoodImage uri={p.image} emoji={p.emoji} style={styles.popularImage} />
                  <Text style={styles.popularName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  <Text style={styles.popularSold}>Продано: {p.sold}</Text>
                </View>
              ))}
            </ScrollView>
          )}
          <Text style={styles.hello}>Вы вошли как {user?.name}</Text>
        </ScrollView>
      )}
      <ChefTabBar />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
  },
  location: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  name: {
    fontSize: 15,
    color: '#676767',
    marginTop: 2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
  },
  stats: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 22,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    ...shadow,
  },
  statValue: {
    fontSize: 46,
    fontWeight: '800',
    color: colors.dark,
  },
  statLabel: {
    fontSize: 13,
    color: '#838799',
    fontWeight: '700',
  },
  card: {
    marginTop: 18,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 18,
    ...shadow,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLabel: {
    fontSize: 14,
    color: colors.dark,
  },
  revenue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.dark,
    marginTop: 4,
  },
  link: {
    fontSize: 13,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  chart: {
    flexDirection: 'row',
    height: 130,
    marginTop: 18,
    gap: 10,
  },
  barWrap: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
    backgroundColor: '#FFD1B8',
  },
  barTop: {
    backgroundColor: colors.primary,
  },
  barLabel: {
    marginTop: 6,
    fontSize: 11,
    color: colors.muted,
  },
  rating: {
    marginTop: 10,
    fontSize: 22,
    fontWeight: '800',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.dark,
  },
  empty: {
    color: colors.subtle,
    fontSize: 14,
    lineHeight: 20,
  },
  popular: {
    width: 150,
    marginRight: 14,
  },
  popularImage: {
    width: 150,
    height: 110,
    borderRadius: 18,
  },
  popularName: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: colors.dark,
  },
  popularSold: {
    fontSize: 12,
    color: colors.subtle,
  },
  hello: {
    marginTop: 26,
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
  },
});
