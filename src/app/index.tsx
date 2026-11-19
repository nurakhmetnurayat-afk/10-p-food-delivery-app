import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Logo from '@/components/Logo';
import Rays from '@/components/Rays';
import { colors } from '@/constants/theme';

export default function Splash() {
  const logo = useRef(new Animated.Value(0)).current;
  const rays = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logo, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(rays, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => router.replace('/onboarding'), 2200);
    return () => clearTimeout(timer);
  }, [logo, rays]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <Animated.View style={{ opacity: logo, transform: [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }}>
        <Logo size={48} />
      </Animated.View>
      <Animated.View style={[styles.rays, { opacity: rays }]}>
        <Rays color={colors.primary} size={260} count={24} thickness={5} style={styles.raysFlip} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rays: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
  raysFlip: {
    transform: [{ scaleX: -1 }, { scaleY: -1 }],
  },
});
