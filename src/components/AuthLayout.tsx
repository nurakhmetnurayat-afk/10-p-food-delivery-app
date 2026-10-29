import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Rays from './Rays';
import { colors, radius } from '@/constants/theme';

type Props = {
  title: string;
  subtitle?: ReactNode;
  back?: boolean;
  children: ReactNode;
};

export default function AuthLayout({ title, subtitle, back = true, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
        <View style={[styles.header, { paddingTop: insets.top + 56 }]}>
          <Rays color="rgba(255,255,255,0.06)" style={styles.raysLeft} />
          <Rays color="rgba(255,255,255,0.06)" style={styles.raysRight} />
          {back && (
            <Pressable
              style={[styles.back, { top: insets.top + 12 }]}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
              hitSlop={8}
            >
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
          )}
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={[styles.card, { paddingBottom: insets.bottom + 28 }]}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  scroll: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 44,
    alignItems: 'center',
    overflow: 'hidden',
  },
  raysLeft: {
    position: 'absolute',
    left: -40,
    top: -40,
  },
  raysRight: {
    position: 'absolute',
    right: -40,
    top: -40,
    transform: [{ scaleX: -1 }],
  },
  back: {
    position: 'absolute',
    left: 24,
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 30,
    lineHeight: 32,
    color: colors.dark,
    marginTop: -3,
    marginLeft: -2,
  },
  title: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
});
