import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius } from '@/constants/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  password?: boolean;
};

export default function Input({ label, error, password, style, ...props }: Props) {
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View>
        <TextInput
          {...props}
          secureTextEntry={password && hidden}
          placeholderTextColor={colors.muted}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            styles.input,
            focused && styles.focused,
            !!error && styles.invalid,
            password && styles.withIcon,
            style,
          ]}
        />
        {password && (
          <Pressable style={styles.eye} onPress={() => setHidden((v) => !v)} hitSlop={10}>
            <Text style={[styles.eyeText, !hidden && styles.eyeActive]}>{hidden ? 'Показать' : 'Скрыть'}</Text>
          </Pressable>
        )}
      </View>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: colors.text,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    height: 62,
    borderRadius: radius.sm,
    backgroundColor: colors.field,
    paddingHorizontal: 20,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  withIcon: {
    paddingRight: 96,
  },
  focused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  invalid: {
    borderColor: colors.error,
  },
  eye: {
    position: 'absolute',
    right: 18,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 13,
    color: colors.muted,
  },
  eyeActive: {
    color: colors.primary,
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: colors.error,
  },
});
