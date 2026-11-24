import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Category, Dish } from '@/api/types';
import { api, errorText } from '@/api/client';
import ChefTabBar from '@/components/ChefTabBar';
import { EmptyState, ErrorState, FoodImage, Loading, Screen } from '@/components/ui';
import { colors, money } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { confirm, notify } from '@/utils/dialog';

export default function ChefMenu() {
  const { data, loading, error, reload } = useApi<Dish[]>('/chef/dishes', { refetchOnFocus: true });
  const categories = useApi<Category[]>('/categories');
  const [tab, setTab] = useState('all');

  const present = (categories.data ?? []).filter((c) => data?.some((d) => d.category === c.id));
  const list = (data ?? []).filter((d) => tab === 'all' || d.category === tab);

  const remove = async (d: Dish) => {
    if (!(await confirm('Убрать из меню?', `«${d.name}» больше не будет видно клиентам.`, 'Убрать'))) return;
    try {
      await api.delete(`/chef/dishes/${d.id}`);
      reload(true);
    } catch (e) {
      notify('Ошибка', errorText(e));
    }
  };

  return (
    <Screen>
      <Text style={styles.title}>Моё меню</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabs}>
        {[{ id: 'all', name: 'Все' }, ...present].map((c) => (
          <Pressable key={c.id} style={[styles.tab, tab === c.id && styles.tabActive]} onPress={() => setTab(c.id)}>
            <Text style={[styles.tabText, tab === c.id && styles.tabTextActive]}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.total}>Всего позиций: {list.length}</Text>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : list.length === 0 ? (
        <EmptyState emoji="🍽️" title="Меню пустое" action="Добавить блюдо" onAction={() => router.replace('/chef/add-dish')} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {list.map((d) => (
            <Pressable key={d.id} style={styles.item} onPress={() => router.push({ pathname: '/dish/[id]', params: { id: d.id } })}>
              <FoodImage uri={d.image} emoji={d.emoji} style={styles.image} emojiSize={40} />
              <View style={{ flex: 1 }}>
                <View style={styles.row}>
                  <Text style={styles.name} numberOfLines={2}>
                    {d.name}
                  </Text>
                  <Pressable onPress={() => remove(d)} hitSlop={10} accessibilityLabel="Убрать из меню">
                    <Text style={styles.more}>✕</Text>
                  </Pressable>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{categories.data?.find((c) => c.id === d.category)?.name ?? d.category}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.meta}>
                    <Text style={{ color: colors.primary }}>★ </Text>
                    {d.rating} · продано {d.sold ?? 0}
                    {d.custom ? ' · новое' : ''}
                  </Text>
                  <Text style={styles.price}>{money(d.price)}</Text>
                </View>
              </View>
            </Pressable>
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
  tabsScroll: {
    flexGrow: 0,
    marginTop: 12,
  },
  tabs: {
    paddingHorizontal: 24,
    gap: 18,
  },
  tab: {
    paddingVertical: 10,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: '#A5A7B9',
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  total: {
    paddingHorizontal: 24,
    marginTop: 14,
    color: '#9C9BA6',
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  item: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
  },
  image: {
    width: 102,
    height: 102,
    borderRadius: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark,
  },
  more: {
    fontSize: 14,
    color: colors.muted,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFEBE4',
    borderRadius: 29,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginVertical: 8,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
  },
  meta: {
    fontSize: 13,
    color: colors.dark,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.dark,
  },
});
