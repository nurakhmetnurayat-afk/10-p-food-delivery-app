import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Category, Order, Promo, Restaurant } from '@/api/types';
import { api } from '@/api/client';
import { RestaurantCard } from '@/components/cards';
import { Chip, CircleButton, ErrorState, Loading, Screen, SectionTitle } from '@/components/ui';
import { useAuth } from '@/constants/authcontext';
import { useCart } from '@/constants/cartcontext';
import { colors, money, radius } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';

let offerShown = false;

const greeting = () => {
  const h = new Date().getHours();
  if (h < 5) return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { address, setAddress, totalCount, totalPrice, setPromo } = useCart();
  const categories = useApi<Category[]>('/categories');
  const restaurants = useApi<Restaurant[]>('/restaurants', { refetchOnFocus: true });
  const [offer, setOffer] = useState(false);

  useEffect(() => {
    if (!address && user?.address) setAddress(user.address);
  }, [address, user, setAddress]);

  useEffect(() => {
    if (offerShown || !user) return;
    api
      .get<Order[]>('/orders')
      .then((orders) => {
        if (orders.length === 0 && !offerShown) {
          offerShown = true;
          setTimeout(() => setOffer(true), 700);
        }
      })
      .catch(() => {});
  }, [user]);

  const takeOffer = async () => {
    setOffer(false);
    try {
      setPromo(await api.get<Promo>('/promos/FOODGO25'));
    } catch {}
  };

  const firstName = user?.name.split(' ')[0] ?? 'гость';

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + (totalCount ? 110 : 30) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <CircleButton icon="☰" onPress={() => router.push('/profile')} label="Меню" />
          <Pressable style={styles.deliver} onPress={() => router.push('/addresses')}>
            <Text style={styles.deliverLabel}>ДОСТАВИТЬ В</Text>
            <Text style={styles.deliverValue} numberOfLines={1}>
              {address || 'Укажите адрес'} ▾
            </Text>
          </Pressable>
          <CircleButton icon="🛍" dark badge={totalCount} onPress={() => router.push('/cart')} label="Корзина" />
        </View>

        <Text style={styles.hello}>
          Привет, {firstName}, <Text style={styles.helloBold}>{greeting()}!</Text>
        </Text>

        <Pressable style={styles.search} onPress={() => router.push('/search')}>
          <Text style={styles.searchIcon}>⌕</Text>
          <Text style={styles.searchText}>Найти блюдо или ресторан</Text>
        </Pressable>

        <SectionTitle title="Все категории" action="Все" onAction={() => router.push('/categories')} />
        {categories.loading ? null : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
            <Chip label="Все" emoji="🔥" active onPress={() => router.push('/categories')} />
            {categories.data?.map((c) => (
              <Chip
                key={c.id}
                label={c.name}
                emoji={c.emoji}
                onPress={() => router.push({ pathname: '/category/[id]', params: { id: c.id } })}
              />
            ))}
          </ScrollView>
        )}

        <SectionTitle title="Открытые рестораны" action="Все" onAction={() => router.push('/search')} />
        {restaurants.loading ? (
          <Loading />
        ) : restaurants.error ? (
          <ErrorState message={restaurants.error} onRetry={() => restaurants.reload()} />
        ) : (
          restaurants.data?.map((r) => <RestaurantCard key={r.id} restaurant={r} />)
        )}
      </ScrollView>

      {totalCount > 0 && (
        <Pressable style={[styles.bottomBar, { bottom: insets.bottom + 16 }]} onPress={() => router.push('/cart')}>
          <Text style={styles.bottomBarTitle}>Корзина · {totalCount}</Text>
          <Text style={styles.bottomBarPrice}>{money(totalPrice)} →</Text>
        </Pressable>
      )}

      <Modal visible={offer} transparent animationType="fade" onRequestClose={() => setOffer(false)}>
        <View style={styles.overlay}>
          <View style={styles.offer}>
            <Pressable style={styles.offerClose} onPress={() => setOffer(false)} hitSlop={10} accessibilityLabel="Закрыть">
              <Text style={styles.offerCloseText}>✕</Text>
            </Pressable>
            <Text style={styles.offerSpark}>✦ ✧ ✦</Text>
            <Text style={styles.offerTitle}>Горячее{'\n'}предложение!</Text>
            <Text style={styles.offerCode}>#FOODGO25</Text>
            <Text style={styles.offerText}>Скидка 25% на первый заказ по этому промокоду</Text>
            <Pressable style={styles.offerBtn} onPress={takeOffer}>
              <Text style={styles.offerBtnText}>ЗАБРАТЬ СКИДКУ</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deliver: {
    flex: 1,
  },
  deliverLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  deliverValue: {
    fontSize: 14,
    color: '#676767',
    marginTop: 2,
  },
  hello: {
    fontSize: 16,
    color: colors.dark,
    marginTop: 24,
  },
  helloBold: {
    fontWeight: '700',
  },
  search: {
    marginTop: 16,
    height: 62,
    borderRadius: radius.sm,
    backgroundColor: '#F6F6F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  searchIcon: {
    fontSize: 22,
    color: '#A0A5BA',
  },
  searchText: {
    fontSize: 14,
    color: '#676767',
  },
  chips: {
    marginHorizontal: -24,
    paddingLeft: 24,
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
    alignItems: 'center',
  },
  bottomBarTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  bottomBarPrice: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18,18,35,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  offer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 35,
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  offerClose: {
    position: 'absolute',
    top: -14,
    right: -10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE194',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerCloseText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  offerSpark: {
    color: '#FFE194',
    fontSize: 18,
    letterSpacing: 8,
  },
  offerTitle: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  offerCode: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
  },
  offerText: {
    color: colors.white,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 22,
  },
  offerBtn: {
    marginTop: 26,
    width: '100%',
    height: 58,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.6,
  },
});
