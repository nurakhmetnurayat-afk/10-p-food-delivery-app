import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { useAuth } from '@/constants/authcontext';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Logo from '@/components/Logo';
import Rays from '@/components/Rays';
import { colors } from '@/constants/theme';
import { CHEF_HOME } from '@/constants/routes';

export default function Splash() {
  const [logo] = useState(() => new Animated.Value(0));
  const [rays] = useState(() => new Animated.Value(0));
  const { user, ready } = useAuth();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logo, { toValue: 1, friction: 6, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(rays, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
    const timer = setTimeout(() => setShown(true), 2000);
    return () => clearTimeout(timer);
  }, [logo, rays]);

  useEffect(() => {
    if (!shown || !ready) return;
    if (!user) router.replace('/onboarding');
    else router.replace(user.role === 'chef' ? CHEF_HOME : '/home');
  }, [shown, ready, user]);

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
