import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Dish, Restaurant } from '@/api/types';
import { useCart } from '@/constants/cartcontext';
import { useAddToCart } from '@/hooks/useAddToCart';
import { colors, money, radius, shadow } from '@/constants/theme';
import { FoodImage, Meta, PlusButton } from './ui';

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.restaurant, pressed && { opacity: 0.85 }]}
      onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: restaurant.id } })}
    >
      <FoodImage uri={restaurant.image} emoji="🍽️" style={styles.restaurantImage} />
      <Text style={styles.restaurantName}>{restaurant.name}</Text>
      <Text style={styles.restaurantTags}>{restaurant.tags.join(' · ')}</Text>
      <Meta rating={restaurant.rating} fee={restaurant.deliveryFee} time={restaurant.deliveryTime} />
    </Pressable>
  );
}

export function DishCard({ dish, width }: { dish: Dish; width?: number }) {
  const { quantityOf } = useCart();
  const add = useAddToCart();
  const count = quantityOf(dish.id);

  return (
    <Pressable
      style={[styles.dish, width ? { width } : null]}
      onPress={() => router.push({ pathname: '/dish/[id]', params: { id: dish.id } })}
    >
      <FoodImage uri={dish.image} emoji={dish.emoji} style={styles.dishImage} emojiSize={44} />
      <View style={styles.dishCard}>
        <Text style={styles.dishName} numberOfLines={2}>
          {dish.name}
        </Text>
        <Text style={styles.dishRestaurant} numberOfLines={1}>
          {dish.restaurant}
        </Text>
        <View style={styles.dishFooter}>
          <Text style={styles.dishPrice}>{money(dish.price)}</Text>
          <PlusButton count={count} onPress={() => add(dish)} />
        </View>
      </View>
    </Pressable>
  );
}

export function CategoryCard({
  name,
  image,
  emoji,
  minPrice,
  onPress,
}: {
  name: string;
  image: string | null;
  emoji: string;
  minPrice: number;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.category} onPress={onPress}>
      <FoodImage uri={image} emoji={emoji} style={styles.categoryImage} emojiSize={40} />
      <View style={styles.categoryCard}>
        <Text style={styles.categoryName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.categoryFrom}>
          от <Text style={styles.categoryPrice}>{money(minPrice)}</Text>
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  restaurant: {
    marginBottom: 26,
  },
  restaurantImage: {
    width: '100%',
    height: 140,
    borderRadius: 15,
    marginBottom: 10,
  },
  restaurantName: {
    fontSize: 20,
    color: colors.dark,
  },
  restaurantTags: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 10,
  },
  dish: {
    width: '48%',
    marginBottom: 16,
    paddingTop: 30,
  },
  dishImage: {
    width: '84%',
    height: 92,
    borderRadius: 16,
    alignSelf: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  dishCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingTop: 72,
    paddingHorizontal: 14,
    paddingBottom: 14,
    ...shadow,
  },
  dishName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark,
    minHeight: 38,
  },
  dishRestaurant: {
    fontSize: 13,
    color: colors.subtle,
    marginTop: 2,
  },
  dishFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dishPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark,
  },
  category: {
    width: 150,
    marginRight: 14,
    paddingTop: 26,
    paddingBottom: 14,
  },
  categoryImage: {
    width: 116,
    height: 84,
    borderRadius: radius.md,
    alignSelf: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  categoryCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingTop: 66,
    paddingHorizontal: 14,
    paddingBottom: 12,
    ...shadow,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dark,
  },
  categoryFrom: {
    fontSize: 13,
    color: colors.subtle,
    marginTop: 4,
  },
  categoryPrice: {
    color: colors.dark,
    fontWeight: '700',
  },
});
