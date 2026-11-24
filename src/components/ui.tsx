import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, money, radius } from '@/constants/theme';

export function Screen({ children, style, dark }: { children: ReactNode; style?: StyleProp<ViewStyle>; dark?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }, dark && { backgroundColor: colors.dark }, style]}>
      {children}
    </View>
  );
}

export function CircleButton({
  icon,
  onPress,
  dark,
  badge,
  style,
  label,
}: {
  icon: string;
  onPress: () => void;
  dark?: boolean;
  badge?: number;
  style?: StyleProp<ViewStyle>;
  label?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.circle, dark && styles.circleDark, pressed && { opacity: 0.7 }, style]}
    >
      <Text style={[styles.circleIcon, dark && { color: colors.white }]}>{icon}</Text>
      {!!badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Header({
  title,
  right,
  onBack,
  light,
}: {
  title?: string;
  right?: ReactNode;
  onBack?: () => void;
  light?: boolean;
}) {
  const back = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/home')));
  return (
    <View style={styles.header}>
      <CircleButton icon="‹" onPress={back} label="Назад" dark={light} style={light ? styles.circleOnDark : undefined} />
      {!!title && <Text style={[styles.headerTitle, light && { color: colors.white }]}>{title}</Text>}
      <View style={styles.headerRight}>{right}</View>
    </View>
  );
}

export function FoodImage({
  uri,
  emoji,
  style,
  emojiSize = 48,
}: {
  uri: string | null | undefined;
  emoji: string;
  style: StyleProp<ViewStyle>;
  emojiSize?: number;
}) {
  if (uri) return <Image source={{ uri }} style={[styles.imageBase, style] as never} resizeMode="cover" />;
  return (
    <View style={[styles.imageBase, styles.emojiBox, style]}>
      <Text style={{ fontSize: emojiSize }}>{emoji}</Text>
    </View>
  );
}

export function Meta({ rating, fee, time, small }: { rating: number; fee?: number; time: string; small?: boolean }) {
  const size = small ? 12 : 14;
  return (
    <View style={styles.meta}>
      <Text style={[styles.metaText, { fontSize: size }]}>
        <Text style={{ color: colors.primary }}>★ </Text>
        <Text style={styles.metaBold}>{rating}</Text>
      </Text>
      {fee !== undefined && (
        <Text style={[styles.metaText, { fontSize: size }]}>
          <Text style={{ color: colors.primary }}>🛵 </Text>
          {fee === 0 ? 'Бесплатно' : money(fee)}
        </Text>
      )}
      <Text style={[styles.metaText, { fontSize: size }]}>
        <Text style={{ color: colors.primary }}>◷ </Text>
        {time}
      </Text>
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  emoji,
  style,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  emoji?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive, style]}>
      {!!emoji && (
        <View style={[styles.chipEmoji, active && { backgroundColor: colors.white }]}>
          <Text style={{ fontSize: 16 }}>{emoji}</Text>
        </View>
      )}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

export function Stepper({
  value,
  onMinus,
  onPlus,
  dark,
}: {
  value: number;
  onMinus: () => void;
  onPlus: () => void;
  dark?: boolean;
}) {
  return (
    <View style={[styles.stepper, dark && styles.stepperDark]}>
      <Pressable style={styles.stepBtn} onPress={onMinus} hitSlop={6} accessibilityLabel="Меньше">
        <Text style={styles.stepSign}>−</Text>
      </Pressable>
      <Text style={styles.stepValue}>{value}</Text>
      <Pressable style={styles.stepBtn} onPress={onPlus} hitSlop={6} accessibilityLabel="Больше">
        <Text style={styles.stepSign}>+</Text>
      </Pressable>
    </View>
  );
}

export function PlusButton({ onPress, count }: { onPress: () => void; count?: number }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.plus} accessibilityLabel="Добавить в корзину">
      <Text style={styles.plusText}>{count ? count : '+'}</Text>
    </Pressable>
  );
}

export function Stars({
  value,
  onChange,
  size = 20,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable key={n} disabled={!onChange} onPress={() => onChange?.(n)} hitSlop={4}>
          <Text style={{ fontSize: size, color: n <= value ? colors.star : '#E4E4E4' }}>★</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.state}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.state}>
      <Text style={styles.stateEmoji}>📡</Text>
      <Text style={styles.stateTitle}>Не удалось загрузить</Text>
      <Text style={styles.stateText}>{message}</Text>
      {onRetry && (
        <Pressable style={styles.stateBtn} onPress={onRetry}>
          <Text style={styles.stateBtnText}>Повторить</Text>
        </Pressable>
      )}
    </View>
  );
}

export function EmptyState({
  emoji,
  title,
  text,
  action,
  onAction,
}: {
  emoji: string;
  title: string;
  text?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.state}>
      <Text style={styles.stateEmoji}>{emoji}</Text>
      <Text style={styles.stateTitle}>{title}</Text>
      {!!text && <Text style={styles.stateText}>{text}</Text>}
      {!!action && (
        <Pressable style={styles.stateBtn} onPress={onAction}>
          <Text style={styles.stateBtnText}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function SectionTitle({ title, action, onAction, style }: { title: string; action?: string; onAction?: () => void; style?: StyleProp<TextStyle> }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, style]}>{title}</Text>
      {!!action && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{action} ›</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  circle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#ECF0F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDark: {
    backgroundColor: colors.dark,
  },
  circleOnDark: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  circleIcon: {
    fontSize: 22,
    lineHeight: 26,
    color: colors.dark,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    color: colors.dark,
  },
  headerRight: {
    marginLeft: 'auto',
    flexDirection: 'row',
    gap: 10,
  },
  imageBase: {
    overflow: 'hidden',
    backgroundColor: '#98A8B8',
  },
  emojiBox: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    color: colors.text,
  },
  metaBold: {
    fontWeight: '700',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#EDEDED',
    backgroundColor: colors.white,
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipEmoji: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  chipText: {
    fontSize: 15,
    color: colors.dark,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperDark: {
    backgroundColor: colors.dark,
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepSign: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  stepValue: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 22,
    textAlign: 'center',
  },
  plus: {
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 260,
  },
  stateEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark,
    textAlign: 'center',
  },
  stateText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.subtle,
    textAlign: 'center',
    lineHeight: 20,
  },
  stateBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: radius.md,
  },
  stateBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.dark,
  },
  sectionAction: {
    fontSize: 16,
    color: colors.dark,
  },
});
