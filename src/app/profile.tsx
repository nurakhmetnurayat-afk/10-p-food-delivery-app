import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Header, Screen } from '@/components/ui';
import { useAuth } from '@/constants/authcontext';
import { colors } from '@/constants/theme';
import { confirm } from '@/utils/dialog';

type Item = { icon: string; color: string; label: string; href: Href };

const GROUPS: Item[][] = [
  [
    { icon: '👤', color: '#FB6F3D', label: 'Личные данные', href: '/edit-profile' },
    { icon: '🗺', color: '#413DFB', label: 'Адреса', href: '/addresses' },
  ],
  [
    { icon: '🛍', color: '#369BFF', label: 'Корзина', href: '/cart' },
    { icon: '♥', color: '#B33DFB', label: 'Избранное', href: '/favorites' },
    { icon: '🔔', color: '#FFAA2A', label: 'Уведомления', href: '/notifications' },
    { icon: '💳', color: '#369BFF', label: 'Способы оплаты', href: '/cards' },
  ],
  [
    { icon: '🧾', color: '#FB6D3A', label: 'Мои заказы', href: '/orders' },
    { icon: '?', color: '#FB6D3A', label: 'Вопросы и ответы', href: '/faq' },
  ],
];

export default function Profile() {
  const { user, logout } = useAuth();

  const exit = async () => {
    if (!(await confirm('Выйти из аккаунта?', 'Корзина сохранится на этом устройстве до закрытия приложения.', 'Выйти'))) return;
    await logout();
    router.replace('/login');
  };

  if (!user) {
    return (
      <Screen>
        <Header title="Профиль" />
        <View style={styles.guest}>
          <Text style={styles.guestText}>Войдите, чтобы видеть заказы и адреса</Text>
          <Pressable style={styles.guestBtn} onPress={() => router.push('/login')}>
            <Text style={styles.guestBtnText}>ВОЙТИ</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Screen>
      <Header title="Профиль" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.user}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.bio}>{user.bio || user.email}</Text>
          </View>
        </View>

        {GROUPS.map((group, i) => (
          <View key={i} style={styles.group}>
            {group.map((item) => (
              <Pressable key={item.label} style={styles.row} onPress={() => router.push(item.href)}>
                <View style={styles.icon}>
                  <Text style={[styles.iconText, { color: item.color }]}>{item.icon}</Text>
                </View>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.arrow}>›</Text>
              </Pressable>
            ))}
          </View>
        ))}

        <View style={styles.group}>
          <Pressable style={styles.row} onPress={exit}>
            <View style={styles.icon}>
              <Text style={[styles.iconText, { color: '#FB4A59' }]}>⏻</Text>
            </View>
            <Text style={styles.label}>Выйти</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  user: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFC6AE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark,
  },
  bio: {
    marginTop: 6,
    fontSize: 14,
    color: '#A0A5BA',
  },
  group: {
    backgroundColor: '#F6F8FA',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 17,
    fontWeight: '800',
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  arrow: {
    fontSize: 22,
    color: '#747783',
  },
  guest: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  guestText: {
    fontSize: 16,
    color: colors.subtle,
    textAlign: 'center',
  },
  guestBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 14,
  },
  guestBtnText: {
    color: colors.white,
    fontWeight: '700',
  },
});
