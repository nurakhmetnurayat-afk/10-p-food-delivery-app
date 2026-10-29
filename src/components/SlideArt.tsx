import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';

const spots = [
  { top: 6, left: 30, rotate: '-12deg' },
  { top: 0, left: 120, rotate: '8deg' },
  { top: 20, right: 24, rotate: '14deg' },
  { top: 120, left: 0, rotate: '-6deg' },
  { top: 130, right: 0, rotate: '10deg' },
];

export default function SlideArt({ hero, items }: { hero: string; items: string[] }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.circle} />
      {items.map((item, i) => {
        const { rotate, ...pos } = spots[i % spots.length];
        return (
          <Text key={i} style={[styles.item, pos, { transform: [{ rotate }] }]}>
            {item}
          </Text>
        );
      })}
      <Text style={styles.hero}>{hero}</Text>
      <View style={[styles.spark, { top: 70, left: 70 }]} />
      <View style={[styles.spark, { top: 40, right: 80, backgroundColor: colors.primary }]} />
      <View style={[styles.spark, { top: 200, left: 40, width: 6, height: 6 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 280,
    height: 300,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  circle: {
    position: 'absolute',
    bottom: 0,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.primarySoft,
  },
  hero: {
    fontSize: 130,
    marginBottom: 20,
  },
  item: {
    position: 'absolute',
    fontSize: 38,
  },
  spark: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFC529',
  },
});
