import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuth } from '../../constants/authcontext';

export default function ChefLayout() {
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready && user?.role !== 'chef') router.replace('/login');
  }, [ready, user]);

  return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
}
