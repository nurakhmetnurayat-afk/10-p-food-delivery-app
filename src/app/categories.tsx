import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import type { Category } from '@/api/types';
import { CategoryCard } from '@/components/cards';
import { ErrorState, Header, Loading, Screen } from '@/components/ui';
import { useApi } from '@/hooks/useApi';

export default function Categories() {
  const { data, loading, error, reload } = useApi<Category[]>('/categories');

  return (
    <Screen>
      <Header title="Все категории" />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : (
        <ScrollView contentContainerStyle={styles.grid}>
          {data?.map((c) => (
            <View key={c.id} style={styles.cell}>
              <CategoryCard
                name={c.name}
                image={c.image}
                emoji={c.emoji}
                minPrice={c.minPrice}
                onPress={() => router.push({ pathname: '/category/[id]', params: { id: c.id } })}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  cell: {
    width: '48%',
    alignItems: 'center',
  },
});
