import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';

const providers = [
  { id: 'google', label: 'G', name: 'Google', bg: colors.white, color: '#4285F4', border: true },
  { id: 'vk', label: 'VK', name: 'VK', bg: '#0077FF', color: colors.white, border: false },
  { id: 'yandex', label: 'Я', name: 'Яндекс', bg: '#FC3F1D', color: colors.white, border: false },
];

export default function SocialButtons() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.or}>или войдите через</Text>
      <View style={styles.row}>
        {providers.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => Alert.alert(p.name, 'Вход через этот сервис появится позже')}
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: p.bg, borderWidth: p.border ? 1.5 : 0 },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.label, { color: p.color }]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 22,
    alignItems: 'center',
  },
  or: {
    color: colors.muted,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 28,
    marginTop: 16,
  },
  btn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    fontSize: 20,
    fontWeight: '800',
  },
});
