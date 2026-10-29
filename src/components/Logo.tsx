import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';

export default function Logo({ size = 44 }: { size?: number }) {
  const lid = size * 0.6;
  return (
    <View style={styles.row}>
      <Text style={[styles.text, { fontSize: size }]}>F</Text>
      <View style={styles.o}>
        <View style={[styles.cloche, { width: lid, top: -size * 0.32 }]}>
          <View style={[styles.knob, { width: size * 0.12, height: size * 0.12, borderRadius: size }]} />
          <View
            style={[
              styles.dome,
              { width: lid * 0.82, height: lid * 0.41, borderTopLeftRadius: lid, borderTopRightRadius: lid },
            ]}
          />
          <View style={[styles.plate, { width: lid, height: size * 0.08 }]} />
        </View>
        <Text style={[styles.text, styles.accent, { fontSize: size }]}>o</Text>
      </View>
      <Text style={[styles.text, { fontSize: size }]}>od</Text>
      <Text style={[styles.text, styles.accent, { fontSize: size }]}>Go</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  text: {
    fontWeight: '800',
    color: colors.dark,
    letterSpacing: -0.5,
  },
  accent: {
    color: colors.primary,
  },
  o: {
    alignItems: 'center',
  },
  cloche: {
    position: 'absolute',
    alignItems: 'center',
  },
  knob: {
    backgroundColor: colors.primary,
    marginBottom: 1,
  },
  dome: {
    backgroundColor: colors.primary,
  },
  plate: {
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
});
