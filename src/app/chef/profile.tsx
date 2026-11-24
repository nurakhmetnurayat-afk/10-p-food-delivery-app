import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ChefDashboard, Withdrawal } from '@/api/types';
import { api, errorText } from '@/api/client';
import ChefTabBar from '@/components/ChefTabBar';
import { Loading } from '@/components/ui';
import { useAuth } from '@/constants/authcontext';
import { colors, money, radius } from '@/constants/theme';
import { useApi } from '@/hooks/useApi';
import { confirm, dateText, notify } from '@/utils/dialog';

export default function ChefProfile() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const dashboard = useApi<ChefDashboard>('/chef/dashboard', { refetchOnFocus: true });
  const history = useApi<Withdrawal[]>('/chef/withdrawals', { refetchOnFocus: true });
  const [done, setDone] = useState<number | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const withdraw = async () => {
    try {
      const res = await api.post<{ amount: number }>('/chef/withdraw');
      setDone(res.amount);
      dashboard.reload(true);
      history.reload(true);
    } catch (e) {
      notify('Вывод недоступен', errorText(e));
    }
  };

  const exit = async () => {
    if (!(await confirm('Выйти?', 'Вы выйдете из кабинета ресторана.', 'Выйти'))) return;
    await logout();
    router.replace('/login');
  };

  if (dashboard.loading) return <Loading />;
  const d = dashboard.data;

  return (
    <View style={styles.root}>
      <View style={[styles.hero, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.heroLabel}>{d?.restaurant.name ?? 'Ресторан'}</Text>
        <Text style={styles.heroSmall}>Доступно к выводу</Text>
        <Text style={styles.balance}>{money(d?.balance ?? 0)}</Text>
        <Pressable style={styles.withdraw} onPress={withdraw}>
          <Text style={styles.withdrawText}>Вывести</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.group}>
          <Row icon="👤" label="Личные данные" onPress={() => router.push('/edit-profile')} />
          <Row icon="⭐" label="Отзывы клиентов" onPress={() => router.push('/chef/reviews')} />
        </View>
        <View style={styles.group}>
          <Row icon="💸" label="История выводов" value={String(history.data?.length ?? 0)} onPress={() => setShowHistory((v) => !v)} />
          {showHistory &&
            history.data?.map((w) => (
              <View key={w.id} style={styles.historyRow}>
                <Text style={styles.historyText}>{dateText(w.at)}</Text>
                <Text style={styles.historyAmount}>{money(w.amount)}</Text>
              </View>
            ))}
          <Row icon="🧾" label="Заработано всего" value={money(d?.earned ?? 0)} onPress={() => router.replace('/chef/orders')} />
        </View>
        <View style={styles.group}>
          <Row icon="⏻" label="Выйти" onPress={exit} />
        </View>
        <Text style={styles.note}>
          {user?.email} · выплата 85% от суммы блюд доставленных заказов. Учебный проект: деньги не переводятся.
        </Text>
      </ScrollView>
      <ChefTabBar />

      <Modal visible={done !== null} transparent animationType="fade" onRequestClose={() => setDone(null)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.sparkles}>✦ ✧ ✦</Text>
            <View style={styles.check}>
              <Text style={styles.checkText}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>Вывод оформлен</Text>
            <Text style={styles.modalText}>{money(done ?? 0)} будут отправлены на счёт ресторана</Text>
            <Pressable style={styles.ok} onPress={() => setDone(null)}>
              <Text style={styles.okText}>ОК</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Row({ icon, label, value, onPress }: { icon: string; label: string; value?: string; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.icon}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
      {!!value && <Text style={styles.value}>{value}</Text>}
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  hero: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroLabel: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  heroSmall: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 14,
  },
  balance: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '800',
    marginTop: 4,
  },
  withdraw: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  withdrawText: {
    color: colors.white,
    fontWeight: '700',
  },
  content: {
    padding: 24,
  },
  group: {
    backgroundColor: '#F6F8FA',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  value: {
    fontSize: 14,
    color: colors.muted,
  },
  arrow: {
    fontSize: 22,
    color: '#747783',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 54,
    paddingVertical: 6,
  },
  historyText: {
    color: colors.subtle,
    fontSize: 13,
  },
  historyAmount: {
    color: colors.dark,
    fontWeight: '700',
    fontSize: 13,
  },
  note: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18,18,35,0.5)',
    justifyContent: 'center',
    padding: 32,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
  },
  sparkles: {
    color: colors.primary,
    letterSpacing: 8,
  },
  check: {
    marginTop: 14,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: colors.white,
    fontSize: 44,
    fontWeight: '800',
  },
  modalTitle: {
    marginTop: 18,
    fontSize: 20,
    fontWeight: '800',
    color: colors.dark,
  },
  modalText: {
    marginTop: 8,
    color: colors.subtle,
    textAlign: 'center',
  },
  ok: {
    marginTop: 22,
    alignSelf: 'stretch',
    height: 54,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  okText: {
    color: colors.white,
    fontWeight: '700',
  },
});
