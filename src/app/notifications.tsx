import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { AppNotification } from '@/api/types';
import { EmptyState, ErrorState, FoodImage, Header, Loading, Screen } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { dateText } from '@/utils/dialog';

const ICONS: Record<AppNotification['status'], string> = {
  accepted: '🧾',
  cooking: '👨‍🍳',
  on_the_way: '🛵',
  delivered: '✅',
  cancelled: '✖️',
};

export default function Notifications() {
  const { data, loading, error, reload } = useApi<AppNotification[]>('/notifications', { refetchOnFocus: true, pollMs: 10000 });

  return (
    <Screen>
      <Header title="Уведомления" />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : !data?.length ? (
        <EmptyState emoji="🔔" title="Уведомлений нет" text="Здесь появятся статусы ваших заказов" />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {data.map((n) => (
            <Pressable key={n.id} style={styles.row} onPress={() => router.push({ pathname: '/track/[id]', params: { id: n.orderId } })}>
              <View style={styles.icon}>
                <Text style={{ fontSize: 22 }}>{ICONS[n.status]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{n.text}</Text>
                <Text style={styles.text}>{n.title}</Text>
                <Text style={styles.time}>{dateText(n.at)}</Text>
              </View>
              <FoodImage uri={n.image} emoji="🍽️" style={styles.image} />
            </Pressable>
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F9',
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark,
  },
  text: {
    fontSize: 13,
    color: colors.subtle,
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
});
