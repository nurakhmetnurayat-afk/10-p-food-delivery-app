import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import type { Dish, Restaurant } from '@/api/types';
import { DishCard } from '@/components/cards';
import { CircleButton, EmptyState, FoodImage, Header, Loading, Screen, SectionTitle } from '@/components/ui';
import { useCart } from '@/constants/cartcontext';
import { colors, radius } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';

const DEFAULT_RECENT = ['Бургер', 'Пицца', 'Плов', 'Суши'];

export default function Search() {
  const { totalCount } = useCart();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState(DEFAULT_RECENT);
  const [debounced, setDebounced] = useState('');
  const restaurants = useApi<Restaurant[]>('/restaurants');
  const popular = useApi<Dish[]>('/dishes?popular=1');
  const results = useApi<Dish[]>(debounced ? `/dishes?q=${encodeURIComponent(debounced)}` : null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const remember = (word: string) => setRecent((list) => [word, ...list.filter((w) => w !== word)].slice(0, 6));

  const q = debounced.toLowerCase();
  const foundRestaurants = q ? (restaurants.data ?? []).filter((r) => r.name.toLowerCase().includes(q) || r.tags.some((t) => t.toLowerCase().includes(q))) : [];

  const openRestaurant = (r: Restaurant) => {
    if (debounced) remember(debounced);
    router.push({ pathname: '/restaurant/[id]', params: { id: r.id } });
  };

  return (
    <Screen>
      <Header
        title="Поиск"
        right={<CircleButton icon="🛍" dark badge={totalCount} onPress={() => router.push('/cart')} label="Корзина" />}
      />
      <View style={styles.inputWrap}>
        <Text style={styles.inputIcon}>⌕</Text>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Блюдо, ресторан или категория"
          placeholderTextColor={colors.muted}
          autoFocus
          returnKeyType="search"
          onSubmitEditing={() => debounced && remember(debounced)}
        />
        {!!query && (
          <Pressable onPress={() => setQuery('')} hitSlop={8} style={styles.clear}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!debounced ? (
          <>
            <SectionTitle title="Недавние запросы" />
            <View style={styles.keywords}>
              {recent.map((w) => (
                <Pressable key={w} style={styles.keyword} onPress={() => setQuery(w)}>
                  <Text style={styles.keywordText}>{w}</Text>
                </Pressable>
              ))}
            </View>

            <SectionTitle title="Рекомендуем рестораны" />
            {restaurants.data?.map((r) => (
              <Pressable key={r.id} style={styles.row} onPress={() => openRestaurant(r)}>
                <FoodImage uri={r.image} emoji="🍽️" style={styles.rowImage} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{r.name}</Text>
                  <Text style={styles.rowMeta}>
                    <Text style={{ color: colors.primary }}>★ </Text>
                    {r.rating}
                  </Text>
                </View>
              </Pressable>
            ))}

            <SectionTitle title="Популярное" />
            <View style={styles.grid}>{popular.data?.map((d) => <DishCard key={d.id} dish={d} />)}</View>
          </>
        ) : results.loading ? (
          <Loading />
        ) : (
          <>
            {foundRestaurants.length > 0 && <SectionTitle title="Рестораны" />}
            {foundRestaurants.map((r) => (
              <Pressable key={r.id} style={styles.row} onPress={() => openRestaurant(r)}>
                <FoodImage uri={r.image} emoji="🍽️" style={styles.rowImage} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{r.name}</Text>
                  <Text style={styles.rowMeta}>{r.tags.join(' · ')}</Text>
                </View>
              </Pressable>
            ))}
            {(results.data?.length ?? 0) > 0 && <SectionTitle title={`Блюда (${results.data?.length})`} />}
            <View style={styles.grid}>{results.data?.map((d) => <DishCard key={d.id} dish={d} />)}</View>
            {!results.data?.length && !foundRestaurants.length && (
              <EmptyState emoji="🔍" title="Ничего не нашли" text={`По запросу «${debounced}» нет блюд и ресторанов`} />
            )}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    marginHorizontal: 24,
    marginTop: 8,
    height: 62,
    borderRadius: radius.sm,
    backgroundColor: '#F6F6F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  inputIcon: {
    fontSize: 22,
    color: colors.muted,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.dark,
    height: '100%',
  },
  clear: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#CDCDCF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '800',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  keywords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  keyword: {
    borderWidth: 2,
    borderColor: '#EDEDED',
    borderRadius: 33,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  keywordText: {
    fontSize: 15,
    color: colors.dark,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
  },
  rowImage: {
    width: 60,
    height: 50,
    borderRadius: 8,
  },
  rowTitle: {
    fontSize: 16,
    color: colors.dark,
  },
  rowMeta: {
    fontSize: 14,
    color: colors.subtle,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
