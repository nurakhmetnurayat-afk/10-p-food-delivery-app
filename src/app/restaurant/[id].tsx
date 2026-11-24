import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RestaurantDetail } from '@/api/types';
import { DishCard } from '@/components/cards';
import { Chip, CircleButton, ErrorState, FoodImage, Loading, Meta, SectionTitle, Stars } from '@/components/ui';
import { useCart } from '@/constants/cartcontext';
import { colors, money } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { totalCount, totalPrice, restaurantId } = useCart();
  const { data, loading, error, reload } = useApi<RestaurantDetail>(`/restaurants/${id}`);
  const [category, setCategory] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? 'Ресторан не найден'} onRetry={() => reload()} />;

  const selected = category ?? data.categories[0]?.id;
  const current = data.categories.find((c) => c.id === selected);
  const menu = data.menu.filter((d) => d.category === selected);
  const showCart = totalCount > 0 && restaurantId === data.id;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + (showCart ? 110 : 30) }} showsVerticalScrollIndicator={false}>
        <View>
          <FoodImage uri={data.image} emoji="🍽️" style={[styles.cover, { height: 300 + insets.top }]} />
          <View style={[styles.coverButtons, { top: insets.top + 12 }]}>
            <CircleButton icon="‹" onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} label="Назад" style={styles.coverBtn} />
            <CircleButton icon="⌕" onPress={() => router.push('/search')} label="Поиск" style={styles.coverBtn} />
          </View>
        </View>

        <View style={styles.body}>
          <Meta rating={data.rating} fee={data.deliveryFee} time={data.deliveryTime} />
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.description}>{data.description}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            {data.categories.map((c) => (
              <Chip key={c.id} label={c.name} active={c.id === selected} onPress={() => setCategory(c.id)} />
            ))}
          </ScrollView>

          <SectionTitle title={`${current?.name ?? 'Меню'} (${menu.length})`} />
          <View style={styles.grid}>
            {menu.map((d) => (
              <DishCard key={d.id} dish={d} />
            ))}
          </View>

          <SectionTitle title={`Отзывы · ${data.reviewsCount}`} />
          {data.reviews.length === 0 ? (
            <Text style={styles.noReviews}>Пока нет отзывов из приложения. Оцените заказ первым!</Text>
          ) : (
            data.reviews.map((r) => (
              <View key={r.id} style={styles.review}>
                <View style={styles.reviewTop}>
                  <Text style={styles.reviewName}>{r.userName}</Text>
                  <Stars value={r.rating} size={14} />
                </View>
                <Text style={styles.reviewTitle}>{r.title}</Text>
                {!!r.text && <Text style={styles.reviewText}>{r.text}</Text>}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {showCart && (
        <Pressable style={[styles.bottomBar, { bottom: insets.bottom + 16 }]} onPress={() => router.push('/cart')}>
          <Text style={styles.bottomBarText}>Корзина · {totalCount}</Text>
          <Text style={styles.bottomBarText}>{money(totalPrice)} →</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  cover: {
    width: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  coverButtons: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coverBtn: {
    backgroundColor: colors.white,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 22,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark,
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
    marginTop: 8,
  },
  chips: {
    marginTop: 22,
    marginHorizontal: -24,
    paddingLeft: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  noReviews: {
    color: colors.subtle,
    fontSize: 14,
  },
  review: {
    backgroundColor: colors.field,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewName: {
    fontWeight: '700',
    color: colors.dark,
  },
  reviewTitle: {
    marginTop: 6,
    color: colors.dark,
    fontSize: 14,
  },
  reviewText: {
    marginTop: 4,
    color: colors.subtle,
    fontSize: 13,
    lineHeight: 19,
  },
  bottomBar: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomBarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
