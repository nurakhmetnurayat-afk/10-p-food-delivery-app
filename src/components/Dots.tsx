import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';

type Props = {
  count: number;
  active: number;
  onSelect?: (index: number) => void;
};

export default function Dots({ count, active, onSelect }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <Pressable key={i} onPress={() => onSelect?.(i)} hitSlop={6}>
          <View style={[styles.dot, i === active && styles.active]} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFE1CE',
  },
  active: {
    width: 26,
    backgroundColor: colors.primary,
  },
});
