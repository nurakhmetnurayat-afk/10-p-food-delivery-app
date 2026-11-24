import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, ScrollViewInstance, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Message, Order } from '@/api/types';
import { api, errorText } from '@/api/client';
import { CircleButton, Screen } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { notify, timeText } from '@/utils/dialog';

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const order = useApi<Order>(`/orders/${id}`);
  const messages = useApi<Message[]>(`/orders/${id}/messages`, { pollMs: 2000 });
  const [text, setText] = useState('');
  const scroll = useRef<ScrollViewInstance>(null);

  const count = messages.data?.length ?? 0;
  useEffect(() => {
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  }, [count]);

  const send = async () => {
    const value = text.trim();
    if (!value) return;
    setText('');
    try {
      const saved = await api.post<Message>(`/orders/${id}/messages`, { text: value });
      messages.setData((list) => [...(list ?? []), saved]);
    } catch (e) {
      setText(value);
      notify('Не отправлено', errorText(e));
    }
  };

  const courier = order.data?.courier;

  return (
    <Screen>
      <View style={styles.header}>
        <CircleButton icon="✕" onPress={() => router.back()} label="Закрыть" />
        <Text style={styles.title}>{courier ? `${courier.name} · курьер` : 'Чат'}</Text>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={styles.list}>
          {count === 0 && <Text style={styles.empty}>Напишите курьеру — он ответит прямо здесь</Text>}
          {messages.data?.map((m) => {
            const mine = m.from === 'me';
            return (
              <View key={m.id} style={[styles.row, mine && styles.rowMine]}>
                {!mine && (
                  <View style={styles.avatar}>
                    <Text>{courier?.avatar ?? '🧑'}</Text>
                  </View>
                )}
                <View style={{ maxWidth: '75%' }}>
                  <Text style={[styles.time, mine && { textAlign: 'right' }]}>{timeText(m.createdAt)}</Text>
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    <Text style={[styles.bubbleText, mine && { color: colors.white }]}>{m.text}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View style={[styles.inputBar, { marginBottom: insets.bottom + 12 }]}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Написать сообщение"
            placeholderTextColor={colors.muted}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Pressable onPress={send} hitSlop={8} accessibilityLabel="Отправить">
            <Text style={styles.send}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  title: {
    fontSize: 17,
    color: colors.dark,
  },
  list: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 14,
  },
  empty: {
    textAlign: 'center',
    color: colors.muted,
    marginTop: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFC6AE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 4,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  bubbleMine: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#F0F5FA',
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    color: colors.dark,
  },
  inputBar: {
    marginHorizontal: 24,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F0F5FA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.dark,
    height: '100%',
  },
  send: {
    fontSize: 22,
    color: colors.primary,
  },
});
