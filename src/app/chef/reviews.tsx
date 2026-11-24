import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Review } from '@/api/types';
import { EmptyState, ErrorState, Header, Loading, Screen, Stars } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { dateText } from '@/utils/dialog';
import { CHEF_HOME } from '@/constants/routes';

export default function ChefReviews() {
  const { data, loading, error, reload } = useApi<Review[]>('/chef/reviews', { refetchOnFocus: true });

  return (
    <Screen>
      <Header title="Отзывы" onBack={() => (router.canGoBack() ? router.back() : router.replace(CHEF_HOME))} />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : !data?.length ? (
        <EmptyState emoji="⭐" title="Отзывов пока нет" text="Клиенты могут оценить доставленный заказ в разделе «Мои заказы»" />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {data.map((r) => (
            <View key={r.id} style={styles.item}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{r.userName[0]}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.date}>{dateText(r.createdAt)}</Text>
                <Text style={styles.title}>{r.title}</Text>
                <Stars value={r.rating} size={16} />
                {!!r.text && <Text style={styles.text}>{r.text}</Text>}
                <Text style={styles.author}>— {r.userName}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 24,
    paddingBottom: 30,
    gap: 16,
  },
  item: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFC6AE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '800',
    color: colors.primary,
    fontSize: 18,
  },
  card: {
    flex: 1,
    backgroundColor: '#F6F8FA',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  date: {
    fontSize: 12,
    color: colors.muted,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark,
  },
  text: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.subtle,
  },
  author: {
    fontSize: 12,
    color: colors.muted,
  },
});
