import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Order } from '@/api/types';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';

export default function Call() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { data: order } = useApi<Order>(`/orders/${id}`);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const courier = order?.courier;
  const status = seconds < 4 ? 'Соединение…' : `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <View style={[styles.top, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.bigAvatar}>{courier?.avatar ?? '🧑'}</Text>
      </View>
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 44 }}>{courier?.avatar ?? '🧑'}</Text>
        </View>
        <Text style={styles.name}>{courier?.name ?? 'Курьер'}</Text>
        <Text style={styles.status}>{status}</Text>
        <Text style={styles.note}>Демо-звонок внутри приложения</Text>

        <View style={styles.buttons}>
          <Pressable style={[styles.side, muted && styles.sideOn]} onPress={() => setMuted((v) => !v)} accessibilityLabel="Микрофон">
            <Text style={styles.sideIcon}>{muted ? '🔇' : '🎙'}</Text>
          </Pressable>
          <Pressable style={styles.end} onPress={() => router.back()} accessibilityLabel="Завершить">
            <Text style={styles.endIcon}>✆</Text>
          </Pressable>
          <Pressable style={[styles.side, speaker && styles.sideOn]} onPress={() => setSpeaker((v) => !v)} accessibilityLabel="Динамик">
            <Text style={styles.sideIcon}>🔊</Text>
          </Pressable>
        </View>

        {!!courier && (
          <Pressable onPress={() => Linking.openURL(`tel:${courier.phone.replace(/\s/g, '')}`)} style={{ marginTop: 26 }}>
            <Text style={styles.phone}>Позвонить с телефона: {courier.phone}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#3B3B4F',
  },
  top: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigAvatar: {
    fontSize: 160,
    opacity: 0.5,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    paddingTop: 0,
    paddingHorizontal: 24,
  },
  avatar: {
    marginTop: -55,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFC6AE',
    borderWidth: 5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: '700',
    color: colors.dark,
  },
  status: {
    marginTop: 6,
    fontSize: 16,
    color: colors.subtle,
  },
  note: {
    marginTop: 4,
    fontSize: 12,
    color: colors.muted,
  },
  buttons: {
    marginTop: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  side: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideOn: {
    backgroundColor: colors.primarySoft,
  },
  sideIcon: {
    fontSize: 22,
  },
  end: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F23D3D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 10,
    borderColor: '#FFD8D8',
  },
  endIcon: {
    color: colors.white,
    fontSize: 26,
    transform: [{ rotate: '135deg' }],
  },
  phone: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
