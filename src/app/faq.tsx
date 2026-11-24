import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { FaqItem } from '@/api/types';
import { ErrorState, Header, Loading, Screen } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';

export default function Faq() {
  const { data, loading, error, reload } = useApi<FaqItem[]>('/faq');
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Screen>
      <Header title="Вопросы и ответы" />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {data?.map((item, i) => (
            <Pressable key={item.q} style={styles.item} onPress={() => setOpen(open === i ? null : i)}>
              <View style={styles.row}>
                <Text style={styles.q}>{item.q}</Text>
                <Text style={styles.arrow}>{open === i ? '−' : '+'}</Text>
              </View>
              {open === i && <Text style={styles.a}>{item.a}</Text>}
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
    gap: 12,
  },
  item: {
    backgroundColor: '#F6F8FA',
    borderRadius: 16,
    padding: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  q: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.dark,
  },
  arrow: {
    fontSize: 22,
    color: colors.primary,
  },
  a: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: colors.subtle,
  },
});
