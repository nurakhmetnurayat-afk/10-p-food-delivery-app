import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius } from '@/constants/theme';

function MapArt() {
  return (
    <View style={styles.map}>
      <View style={[styles.road, { width: 360, top: 80, transform: [{ rotate: '-28deg' }] }]} />
      <View style={[styles.road, { width: 360, top: 170, transform: [{ rotate: '62deg' }] }]} />
      <View style={[styles.road, styles.roadThin, { width: 360, top: 40, transform: [{ rotate: '62deg' }], left: 60 }]} />
      <View style={[styles.road, styles.roadThin, { width: 360, top: 190, transform: [{ rotate: '-28deg' }] }]} />
      <View style={styles.pinShadow} />
      <View style={styles.pin}>
        <View style={styles.pinDot} />
      </View>
    </View>
  );
}

export default function LocationAccess() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const request = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        await Location.getCurrentPositionAsync({});
        router.replace('/home');
      } else {
        Alert.alert('Нет доступа', 'Адрес доставки можно будет указать вручную');
        router.replace('/home');
      }
    } catch {
      router.replace('/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 40 }]}>
      <StatusBar style="dark" />
      <View style={styles.center}>
        <MapArt />
      </View>
      <Pressable
        onPress={request}
        disabled={loading}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Text style={styles.btnText}>Разрешить геолокацию</Text>
            <View style={styles.btnIcon}>
              <View style={styles.btnIconDot} />
            </View>
          </>
        )}
      </Pressable>
      <Text style={styles.note}>FoodGo использует геолокацию только во время работы приложения, чтобы найти рестораны рядом</Text>
      <Pressable onPress={() => router.replace('/home')} hitSlop={8}>
        <Text style={styles.manual}>Указать адрес вручную</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.mapLand,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  road: {
    position: 'absolute',
    left: -60,
    height: 26,
    backgroundColor: colors.mapRoad,
  },
  roadThin: {
    height: 12,
  },
  pinShadow: {
    position: 'absolute',
    top: 150,
    width: 46,
    height: 14,
    borderRadius: 23,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  pin: {
    width: 70,
    height: 70,
    marginTop: -40,
    borderRadius: 35,
    borderBottomRightRadius: 0,
    backgroundColor: colors.primary,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.white,
  },
  btn: {
    height: 62,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  btnPressed: {
    backgroundColor: colors.primaryDark,
  },
  btnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  btnIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIconDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.white,
  },
  note: {
    marginTop: 30,
    color: '#646982',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  manual: {
    marginTop: 16,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
});
