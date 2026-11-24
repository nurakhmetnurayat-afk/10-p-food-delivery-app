import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { Category, Dish, Restaurant } from '@/api/types';
import { DishCard, RestaurantCard } from '@/components/cards';
import { CircleButton, EmptyState, ErrorState, Header, Loading, Screen, SectionTitle } from '@/components/ui';
import { colors, radius } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';

type Filters = {
  freeDelivery: boolean;
  maxTime: 0 | 30 | 40;
  price: 0 | 1 | 2 | 3;
  rating: number;
};

const EMPTY: Filters = { freeDelivery: false, maxTime: 0, price: 0, rating: 0 };
const PRICE = [
  { id: 1, label: '₸', test: (p: number) => p < 1500 },
  { id: 2, label: '₸₸', test: (p: number) => p >= 1500 && p < 3000 },
  { id: 3, label: '₸₸₸', test: (p: number) => p >= 3000 },
] as const;

const minutes = (time: string) => Number(time.match(/\d+/g)?.pop() ?? 99);

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const categories = useApi<Category[]>('/categories');
  const dishes = useApi<Dish[]>(`/dishes?category=${id}`);
  const restaurants = useApi<Restaurant[]>(`/restaurants?category=${id}`);
  const [picker, setPicker] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [draft, setDraft] = useState<Filters>(EMPTY);

  const category = categories.data?.find((c) => c.id === id);
  const active = JSON.stringify(filters) !== JSON.stringify(EMPTY);

  const filteredRestaurants = useMemo(
    () =>
      (restaurants.data ?? []).filter(
        (r) =>
          (!filters.freeDelivery || r.deliveryFee === 0) &&
          (!filters.maxTime || minutes(r.deliveryTime) <= filters.maxTime) &&
          r.rating >= filters.rating,
      ),
    [restaurants.data, filters],
  );

  const filteredDishes = useMemo(() => {
    const ids = new Set(filteredRestaurants.map((r) => r.id));
    const priceRule = PRICE.find((p) => p.id === filters.price);
    return (dishes.data ?? []).filter((d) => ids.has(d.restaurantId) && (!priceRule || priceRule.test(d.price)));
  }, [dishes.data, filteredRestaurants, filters.price]);

  const openFilter = () => {
    setDraft(filters);
    setFilterOpen(true);
  };

  const toggle = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setDraft((d) => ({ ...d, [key]: d[key] === value ? EMPTY[key] : value }));

  return (
    <Screen>
      <Header
        right={
          <>
            <CircleButton icon="⌕" dark onPress={() => router.push('/search')} label="Поиск" />
            <CircleButton icon="⚙" onPress={openFilter} badge={active ? 1 : undefined} label="Фильтр" />
          </>
        }
      />
      <Pressable style={styles.picker} onPress={() => setPicker(true)}>
        <Text style={styles.pickerText}>
          {category ? `${category.emoji} ${category.name.toUpperCase()}` : '…'}
        </Text>
        <Text style={styles.pickerArrow}>▾</Text>
      </Pressable>

      {dishes.loading || restaurants.loading ? (
        <Loading />
      ) : dishes.error ? (
        <ErrorState message={dishes.error} onRetry={() => dishes.reload()} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <SectionTitle title={`Популярное: ${category?.name ?? ''}`} />
          <View style={styles.grid}>
            {filteredDishes.map((d) => (
              <DishCard key={d.id} dish={d} />
            ))}
          </View>
          {filteredDishes.length === 0 && (
            <EmptyState emoji="🧐" title="Ничего не подходит" text="Попробуйте смягчить фильтры" action="Сбросить" onAction={() => setFilters(EMPTY)} />
          )}
          {filteredRestaurants.length > 0 && <SectionTitle title="Открытые рестораны" />}
          {filteredRestaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </ScrollView>
      )}

      <Modal visible={picker} transparent animationType="fade" onRequestClose={() => setPicker(false)}>
        <Pressable style={styles.overlay} onPress={() => setPicker(false)}>
          <View style={styles.sheet}>
            {categories.data?.map((c) => (
              <Pressable
                key={c.id}
                style={styles.sheetRow}
                onPress={() => {
                  setPicker(false);
                  router.setParams({ id: c.id });
                }}
              >
                <Text style={[styles.sheetText, c.id === id && { color: colors.primary, fontWeight: '700' }]}>
                  {c.emoji}  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.filter}>
            <View style={styles.filterHead}>
              <Text style={styles.filterTitle}>Фильтры</Text>
              <CircleButton icon="✕" onPress={() => setFilterOpen(false)} label="Закрыть" />
            </View>

            <Text style={styles.filterLabel}>ДОСТАВКА</Text>
            <View style={styles.options}>
              <Option label="Бесплатная" active={draft.freeDelivery} onPress={() => toggle('freeDelivery', true)} />
            </View>

            <Text style={styles.filterLabel}>ВРЕМЯ ДОСТАВКИ</Text>
            <View style={styles.options}>
              <Option label="до 30 мин" active={draft.maxTime === 30} onPress={() => toggle('maxTime', 30)} />
              <Option label="до 40 мин" active={draft.maxTime === 40} onPress={() => toggle('maxTime', 40)} />
            </View>

            <Text style={styles.filterLabel}>ЦЕНА</Text>
            <View style={styles.options}>
              {PRICE.map((p) => (
                <Option key={p.id} label={p.label} round active={draft.price === p.id} onPress={() => toggle('price', p.id)} />
              ))}
            </View>

            <Text style={styles.filterLabel}>РЕЙТИНГ ОТ</Text>
            <View style={styles.options}>
              {[4.5, 4.7, 4.8].map((r) => (
                <Option key={r} label={`★ ${r}`} active={draft.rating === r} onPress={() => toggle('rating', r)} />
              ))}
            </View>

            <Pressable
              style={styles.apply}
              onPress={() => {
                setFilters(draft);
                setFilterOpen(false);
              }}
            >
              <Text style={styles.applyText}>ПРИМЕНИТЬ</Text>
            </Pressable>
            <Pressable onPress={() => setDraft(EMPTY)} style={styles.reset}>
              <Text style={styles.resetText}>Сбросить</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function Option({ label, active, onPress, round }: { label: string; active: boolean; onPress: () => void; round?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.option, round && styles.optionRound, active && styles.optionActive]}>
      <Text style={[styles.optionText, active && { color: colors.white, fontWeight: '700' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  picker: {
    alignSelf: 'flex-start',
    marginLeft: 24,
    marginTop: -2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#ECF0F4',
    borderRadius: 33,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pickerText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.dark,
  },
  pickerArrow: {
    color: colors.primary,
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18,18,35,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 8,
  },
  sheetRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sheetText: {
    fontSize: 16,
    color: colors.dark,
  },
  filter: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 22,
  },
  filterHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  filterTitle: {
    fontSize: 17,
    color: colors.dark,
  },
  filterLabel: {
    fontSize: 13,
    color: colors.text,
    marginTop: 18,
    marginBottom: 10,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    borderWidth: 2,
    borderColor: '#EDEDED',
    borderRadius: 33,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  optionRound: {
    width: 48,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.dark,
  },
  apply: {
    marginTop: 26,
    height: 58,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  reset: {
    alignItems: 'center',
    paddingTop: 14,
  },
  resetText: {
    color: colors.muted,
    fontSize: 15,
  },
});
