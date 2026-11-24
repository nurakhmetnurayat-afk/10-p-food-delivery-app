import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';

type Point = [number, number];

export const ROUTE: Point[] = [
  [0.78, 0.14],
  [0.78, 0.32],
  [0.52, 0.42],
  [0.52, 0.6],
  [0.3, 0.7],
  [0.22, 0.86],
];

const ROADS = [
  { top: 0.2, rotate: -18, width: 1.6 },
  { top: 0.5, rotate: -18, width: 1.6 },
  { top: 0.78, rotate: -18, width: 1.6 },
  { top: 0.45, rotate: 72, width: 1.5, left: -0.3 },
  { top: 0.45, rotate: 72, width: 1.5, left: 0.15 },
];

const PARKS = [
  { top: 0.05, left: 0.05, w: 0.32, h: 0.16, r: 60 },
  { top: 0.36, left: 0.62, w: 0.34, h: 0.18, r: 70 },
  { top: 0.62, left: 0.6, w: 0.3, h: 0.14, r: 50 },
];

export function pointAt(progress: number): Point {
  const segs = ROUTE.slice(1).map((p, i) => {
    const a = ROUTE[i];
    return { a, b: p, len: Math.hypot(p[0] - a[0], p[1] - a[1]) };
  });
  const total = segs.reduce((s, x) => s + x.len, 0);
  let left = Math.min(Math.max(progress, 0), 1) * total;
  for (const s of segs) {
    if (left <= s.len) {
      const t = s.len ? left / s.len : 0;
      return [s.a[0] + (s.b[0] - s.a[0]) * t, s.a[1] + (s.b[1] - s.a[1]) * t];
    }
    left -= s.len;
  }
  return ROUTE[ROUTE.length - 1];
}

export default function CityMap({ progress, height, pinOnly }: { progress: number; height: number; pinOnly?: boolean }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const px = ([x, y]: Point) => [x * width, y * height] as const;
  const courier = px(pointAt(progress));

  return (
    <View style={[styles.map, { height }]} onLayout={onLayout}>
      {width > 0 && (
        <>
          {PARKS.map((p, i) => (
            <View
              key={i}
              style={[styles.park, { top: p.top * height, left: p.left * width, width: p.w * width, height: p.h * height, borderRadius: p.r }]}
            />
          ))}
          {ROADS.map((r, i) => (
            <View
              key={i}
              style={[
                styles.road,
                {
                  top: r.top * height,
                  left: (r.left ?? -0.3) * width,
                  width: r.width * width,
                  transform: [{ rotate: `${r.rotate}deg` }],
                },
              ]}
            />
          ))}
          {!pinOnly && ROUTE.slice(1).map((b, i) => {
            const [ax, ay] = px(ROUTE[i]);
            const [bx, by] = px(b);
            const len = Math.hypot(bx - ax, by - ay);
            const angle = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
            return (
              <View
                key={i}
                style={[styles.route, { left: ax, top: ay - 2.5, width: len, transform: [{ rotate: `${angle}deg` }] }]}
              />
            );
          })}
          {!pinOnly && (
          <View style={[styles.pin, { left: px(ROUTE[0])[0] - 18, top: px(ROUTE[0])[1] - 18 }]}>
            <Text style={styles.pinText}>🍽</Text>
          </View>
          )}
          <View style={[styles.home, pinOnly ? { left: width / 2 - 18, top: height / 2 - 30 } : { left: px(ROUTE[ROUTE.length - 1])[0] - 18, top: px(ROUTE[ROUTE.length - 1])[1] - 40 }]}>
            <Text style={styles.homeText}>📍</Text>
          </View>
          {!pinOnly && (
            <View style={[styles.courier, { left: courier[0] - 22, top: courier[1] - 22 }]}>
              <Text style={styles.courierText}>🛵</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    backgroundColor: '#F5F4F1',
    overflow: 'hidden',
  },
  park: {
    position: 'absolute',
    backgroundColor: colors.mapPark,
    opacity: 0.8,
  },
  road: {
    position: 'absolute',
    height: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#ECE7DF',
  },
  route: {
    position: 'absolute',
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
    transformOrigin: 'left center',
  },
  pin: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFE194',
    borderWidth: 3,
    borderColor: '#FFC529',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinText: {
    fontSize: 16,
  },
  home: {
    position: 'absolute',
  },
  homeText: {
    fontSize: 36,
  },
  courier: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  courierText: {
    fontSize: 22,
  },
});
