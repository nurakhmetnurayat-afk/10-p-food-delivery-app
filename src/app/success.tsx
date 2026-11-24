import { useEffect, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Screen } from '@/components/ui';
import { colors, radius } from '@/constants/theme';

const confetti = [
  { e: '✦', top: 40, left: 30, c: '#FFC529' },
  { e: '★', top: 10, left: 140, c: '#A78BFA' },
  { e: '✧', top: 30, left: 240, c: colors.primary },
  { e: '●', top: 120, left: 10, c: '#F472B6' },
  { e: '✦', top: 150, left: 260, c: '#A78BFA' },
  { e: '★', top: 200, left: 40, c: '#FFC529' },
];

export default function Success() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [scale] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [scale]);

  return (
    <Screen style={{ paddingBottom: insets.bottom + 20 }}>
      <View style={styles.center}>
        <View style={styles.art}>
          {confetti.map((c, i) => (
            <Text key={i} style={[styles.confetti, { top: c.top, left: c.left, color: c.c }]}>
              {c.e}
            </Text>
          ))}
          <Animated.Text style={[styles.wallet, { transform: [{ scale }] }]}>👛</Animated.Text>
          <Text style={styles.coins}>✨</Text>
        </View>
        <Text style={styles.title}>Поздравляем!</Text>
        <Text style={styles.text}>Заказ оплачен и уже передан в ресторан.{'\n'}Приятного аппетита!</Text>
      </View>
      <Pressable style={styles.btn} onPress={() => router.replace({ pathname: '/track/[id]', params: { id } })}>
        <Text style={styles.btnText}>ОТСЛЕДИТЬ ЗАКАЗ</Text>
      </Pressable>
      <Pressable style={styles.home} onPress={() => router.replace('/home')}>
        <Text style={styles.homeText}>На главную</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  art: {
    width: 290,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confetti: {
    position: 'absolute',
    fontSize: 22,
  },
  wallet: {
    fontSize: 120,
  },
  coins: {
    position: 'absolute',
    top: 40,
    fontSize: 34,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.dark,
    marginTop: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: colors.subtle,
    textAlign: 'center',
  },
  btn: {
    marginHorizontal: 24,
    height: 62,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.6,
  },
  home: {
    alignItems: 'center',
    paddingTop: 16,
  },
  homeText: {
    color: colors.muted,
    fontSize: 15,
  },
});
