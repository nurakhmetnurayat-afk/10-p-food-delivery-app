import { Stack } from 'expo-router';
import { CartProvider } from '../constants/cartcontext';

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </CartProvider>
  );
}