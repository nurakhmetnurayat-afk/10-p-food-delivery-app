import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';
import Logo from '@/components/Logo';
import { colors } from '@/constants/theme';

export default function Home() {
  return (
    <View style={styles.root}>
      <Logo size={36} />
      <Text style={styles.text}>Главный экран в разработке</Text>
      <Button title="Выйти" variant="ghost" onPress={() => router.replace('/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  text: {
    fontSize: 16,
    color: colors.muted,
  },
});
