import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Dish, Size } from '@/api/types';
import { api, errorText } from '@/api/client';
import { ErrorState, FoodImage, Header, Loading, Meta, Screen, Stepper } from '@/components/ui';
import { useAuth } from '@/constants/authcontext';
import { colors, money, radius } from '@/constants/theme';
import { useAddToCart } from '@/hooks/useAddToCart';
import { useApi } from '@/hooks/useApi';
import { notify } from '@/utils/dialog';

export default function DishScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const add = useAddToCart();
  const { data: dish, loading, error, reload } = useApi<Dish>(`/dishes/${id}`);
  const favorites = useApi<Dish[]>(user ? '/favorites' : null);
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [favoriteOverride, setFavorite] = useState<boolean | null>(null);

  if (loading) return <Loading />;
  if (error || !dish) return <ErrorState message={error ?? 'Блюдо не найдено'} onRetry={() => reload()} />;

  const size: Size | null = dish.sizes.find((s) => s.id === sizeId) ?? dish.sizes[0] ?? null;
  const favorite = favoriteOverride ?? !!favorites.data?.some((d) => d.id === id);
  const unit = dish.price + (size?.extra ?? 0);

  const toggleFavorite = async () => {
    if (!user) return router.push('/login');
    const next = !favorite;
    setFavorite(next);
    try {
      if (next) await api.post(`/favorites/${dish.id}`);
      else await api.delete(`/favorites/${dish.id}`);
    } catch (e) {
      setFavorite(!next);
      notify('Ошибка', errorText(e));
    }
  };

  const submit = async () => {
    if (!(await add(dish, size, quantity))) return;
    if (router.canGoBack()) router.back();
    else router.replace({ pathname: '/restaurant/[id]', params: { id: dish.restaurantId } });
  };

  return (
    <Screen>
      <Header title="Детали" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageBox}>
          <FoodImage uri={dish.image} emoji={dish.emoji} style={styles.image} emojiSize={110} />
          <Pressable style={styles.heart} onPress={toggleFavorite} hitSlop={8} accessibilityLabel="В избранное">
            <Text style={[styles.heartText, favorite && { color: colors.white }]}>{favorite ? '♥' : '♡'}</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.restaurant}
          onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: dish.restaurantId } })}
        >
          <Text style={styles.restaurantIcon}>🍽</Text>
          <Text style={styles.restaurantName}>{dish.restaurant}</Text>
        </Pressable>

        <Text style={styles.name}>{dish.name}</Text>
        <Text style={styles.description}>{dish.description}</Text>
        <View style={{ marginTop: 20 }}>
          <Meta rating={dish.rating} time={dish.deliveryTime} />
        </View>

        {dish.sizes.length > 0 && (
          <View style={styles.sizes}>
            <Text style={styles.label}>РАЗМЕР:</Text>
            {dish.sizes.map((s) => (
              <Pressable key={s.id} onPress={() => setSizeId(s.id)} style={[styles.size, size?.id === s.id && styles.sizeActive]}>
                <Text style={[styles.sizeText, size?.id === s.id && styles.sizeTextActive]}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {dish.ingredients.length > 0 && (
          <>
            <Text style={[styles.label, { marginTop: 24 }]}>СОСТАВ</Text>
            <View style={styles.ingredients}>
              {dish.ingredients.map((i) => (
                <View key={i.name} style={styles.ingredient}>
                  <View style={styles.ingredientCircle}>
                    <Text style={{ fontSize: 20 }}>{i.emoji}</Text>
                  </View>
                  <Text style={styles.ingredientName}>{i.name}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.sheetRow}>
          <Text style={styles.price}>{money(unit * quantity)}</Text>
          <Stepper dark value={quantity} onMinus={() => setQuantity((q) => Math.max(1, q - 1))} onPlus={() => setQuantity((q) => q + 1)} />
        </View>
        <Pressable style={styles.addBtn} onPress={submit}>
          <Text style={styles.addText}>В КОРЗИНУ</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  imageBox: {
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#FFC993',
  },
  image: {
    width: '100%',
    height: 184,
  },
  heart: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartText: {
    fontSize: 20,
    color: colors.white,
  },
  restaurant: {
    marginTop: 22,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E9E9E9',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  restaurantIcon: {
    color: colors.primary,
  },
  restaurantName: {
    fontSize: 14,
    color: colors.dark,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark,
    marginTop: 20,
  },
  description: {
    fontSize: 14,
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8,
  },
  sizes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 22,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 13,
    color: colors.text,
  },
  size: {
    minWidth: 52,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F5FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  sizeActive: {
    backgroundColor: colors.primary,
  },
  sizeText: {
    fontSize: 15,
    color: colors.dark,
  },
  sizeTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  ingredients: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 14,
  },
  ingredient: {
    alignItems: 'center',
    width: 54,
  },
  ingredientCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFEBE4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientName: {
    marginTop: 6,
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
  },
  sheet: {
    backgroundColor: colors.field,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 22,
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 28,
    color: colors.dark,
  },
  addBtn: {
    marginTop: 20,
    height: 62,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.6,
  },
});
