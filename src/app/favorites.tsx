import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import type { Dish } from '@/api/types';
import { DishCard } from '@/components/cards';
import { EmptyState, ErrorState, Header, Loading, Screen } from '@/components/ui';
import { useApi } from '@/hooks/useApi';

export default function Favorites() {
  const { data, loading, error, reload } = useApi<Dish[]>('/favorites', { refetchOnFocus: true });

  return (
    <Screen>
      <Header title="Избранное" />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : !data?.length ? (
        <EmptyState emoji="♡" title="Здесь пока пусто" text="Нажмите на сердечко в карточке блюда" action="К меню" onAction={() => router.replace('/home')} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.grid}>
            {data.map((d) => (
              <DishCard key={d.id} dish={d} />
            ))}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
