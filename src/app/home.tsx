import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CATEGORIES, DISHES, Dish } from '../constants/menu';
import { useCart } from '../constants/cartcontext';

export default function HomeScreen() {
  const router = useRouter();
  const { items, address, addToCart, updateQuantity, totalCount, totalPrice } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [search, setSearch] = useState('');

  const filteredDishes = useMemo(() => {
    return DISHES.filter((item) => {
      const matchCategory =
        selectedCategory === 'Все' || item.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.restaurant.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, search]);

  const getItemQuantity = (id: string) =>
    items.find((i) => i.dish.id === id)?.quantity ?? 0;

  const renderDish = ({ item }: { item: Dish }) => {
    const qty = getItemQuantity(item.id);

    return (
      <View style={styles.card}>
        <View style={styles.emojiBox}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardTop}>
            <Text style={styles.restaurant}>{item.restaurant}</Text>
            <Text style={styles.meta}>★ {item.rating} · {item.deliveryTime}</Text>
          </View>

          <Text style={styles.dishName}>{item.name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.cardFooter}>
            <Text style={styles.price}>{item.price} ₸</Text>

            {qty === 0 ? (
              <Pressable style={styles.addBtn} onPress={() => addToCart(item)}>
                <Text style={styles.addBtnText}>+ В корзину</Text>
              </Pressable>
            ) : (
              <View style={styles.counter}>
                <Pressable
                  style={styles.counterBtn}
                  onPress={() => updateQuantity(item.id, -1)}
                >
                  <Text style={styles.counterSign}>−</Text>
                </Pressable>
                <Text style={styles.counterValue}>{qty}</Text>
                <Pressable
                  style={styles.counterBtn}
                  onPress={() => updateQuantity(item.id, 1)}
                >
                  <Text style={styles.counterSign}>+</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Шапка с адресом */}
        <View style={styles.header}>
          <Pressable onPress={() => router.push('/location')}>
            <Text style={styles.addressLabel}>Адрес доставки ▾</Text>
            <Text style={styles.addressValue}>{address}</Text>
          </Pressable>

          <Pressable
            style={styles.cartBadgeBtn}
            onPress={() => router.push('/cart')}
          >
            <Text style={styles.cartBadgeText}>🛒 {totalCount}</Text>
          </Pressable>
        </View>

        {/* Поиск */}
        <TextInput
          style={styles.searchInput}
          placeholder="Найти блюдо или ресторан..."
          placeholderTextColor="#8E8E93"
          value={search}
          onChangeText={setSearch}
        />

        {/* Категории */}
        <View style={styles.categoriesWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((cat) => {
              const active = cat === selectedCategory;
              return (
                <Pressable
                  key={cat}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Список блюд */}
        <FlatList
          data={filteredDishes}
          keyExtractor={(item) => item.id}
          renderItem={renderDish}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Ничего не найдено</Text>
          }
        />

        {/* Нижняя плашка корзины */}
        {totalCount > 0 && (
          <Pressable
            style={styles.bottomBar}
            onPress={() => router.push('/cart')}
          >
            <Text style={styles.bottomBarTitle}>Корзина ({totalCount})</Text>
            <Text style={styles.bottomBarPrice}>{totalPrice} ₸ →</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  addressLabel: { fontSize: 12, color: '#6B7280' },
  addressValue: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 2 },
  cartBadgeBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cartBadgeText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  categoriesWrap: { marginBottom: 12 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  chipText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  chipTextActive: { color: '#FFFFFF' },
  listContent: { paddingBottom: 90 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emojiBox: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: { fontSize: 36 },
  cardBody: { flex: 1 },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  restaurant: { fontSize: 12, fontWeight: '600', color: '#16A34A' },
  meta: { fontSize: 12, color: '#6B7280' },
  dishName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 4 },
  description: { fontSize: 13, color: '#6B7280', marginBottom: 10 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: { fontSize: 16, fontWeight: '800', color: '#111827' },
  addBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  counterBtn: { paddingHorizontal: 10, paddingVertical: 2 },
  counterSign: { fontSize: 18, fontWeight: '700', color: '#111827' },
  counterValue: { fontSize: 15, fontWeight: '700', marginHorizontal: 6 },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 40, fontSize: 15 },
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: '#16A34A',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBarTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  bottomBarPrice: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});