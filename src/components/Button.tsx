import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors, radius } from '@/constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  style?: ViewStyle;
};

export default function Button({ title, onPress, variant = 'primary', disabled, style }: Props) {
  const ghost = variant === 'ghost';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        ghost ? styles.ghost : styles.primary,
        pressed && !ghost && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={ghost ? styles.ghostText : styles.primaryText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    height: 62,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  primaryText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  ghost: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostText: {
    color: colors.muted,
    fontSize: 16,
  },
});
