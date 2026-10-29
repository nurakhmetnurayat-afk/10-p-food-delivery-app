import { StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  color: string;
  size?: number;
  count?: number;
  thickness?: number;
  style?: ViewStyle;
};

export default function Rays({ color, size = 220, count = 22, thickness = 4, style }: Props) {
  return (
    <View pointerEvents="none" style={[{ width: size, height: size }, style]}>
      {Array.from({ length: count }, (_, i) => {
        const deg = (90 * i) / (count - 1);
        return (
          <View
            key={i}
            style={[
              styles.ray,
              {
                width: size,
                height: thickness,
                top: -thickness / 2,
                transform: [{ rotate: `${deg}deg` }],
              },
            ]}
          >
            <View style={[styles.line, { backgroundColor: color, borderRadius: thickness, marginLeft: size * 0.22 }]} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  ray: {
    position: 'absolute',
    left: 0,
    transformOrigin: 'left center',
  },
  line: {
    flex: 1,
  },
});
