import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import type { Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { CHEF_HOME } from '@/constants/routes';

const TABS: { icon: string; label: string; href: Href; match: string }[] = [
  { icon: '▦', label: 'Главная', href: CHEF_HOME, match: '/chef' },
  { icon: '☰', label: 'Меню', href: '/chef/menu', match: '/chef/menu' },
  { icon: '＋', label: 'Добавить', href: '/chef/add-dish', match: '/chef/add-dish' },
  { icon: '🔔', label: 'Заказы', href: '/chef/orders', match: '/chef/orders' },
  { icon: '👤', label: 'Профиль', href: '/chef/profile', match: '/chef/profile' },
];

export default function ChefTabBar() {
  const insets = useSafeAreaInsets();
  const path = usePathname();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}>
      {TABS.map((t, i) => {
        const active = path === t.match;
        const center = i === 2;
        return (
          <Pressable
            key={t.match}
            style={styles.tab}
            accessibilityLabel={t.label}
            onPress={() => !active && router.replace(t.href)}
          >
            <View style={center ? styles.center : null}>
              <Text style={[styles.icon, center && styles.centerIcon, active && !center && { color: colors.primary }]}>{t.icon}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingTop: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    color: '#A5A5BA',
  },
  center: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF1EA',
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -26,
  },
  centerIcon: {
    color: colors.primary,
    fontSize: 26,
  },
});
