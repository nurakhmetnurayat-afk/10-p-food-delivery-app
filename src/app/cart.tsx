import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../constants/cartcontext';

export default function CartScreen() {
  const router = useRouter();
  const { items, address, setAddress, updateQuantity, clearCart, totalPrice } = useCart();
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');

  const deliveryFee = items.length > 0 ? 500 : 0;
  const finalTotal = totalPrice + deliveryFee;

  const handleCheckout = () => {
    if (!address.trim()) {
      Alert.alert('Укажите адрес', 'Введите адрес доставки перед оформлением заказа.');
      return;
    }

    Alert.alert(
      'Заказ оформлен!',
      `Ваш заказ на сумму ${finalTotal} ₸ принят. Курьер прибудет по адресу: ${address}.`,
      [
        {
          text: 'Отлично',
          onPress: () => {
            clearCart();
            router.replace('/home');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>← Назад</Text>
          </Pressable>
          <Text style={styles.title}>Корзина</Text>
          <View style={{ width: 50 }} />
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🛍️</Text>
            <Text style={styles.emptyTitle}>Корзина пуста</Text>
            <Pressable style={styles.goMenuBtn} onPress={() => router.replace('/home')}>
              <Text style={styles.goMenuText}>Перейти в меню</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <FlatList
              data={items}
              keyExtractor={(item) => item.dish.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.itemRow}>
                  <Text style={styles.itemEmoji}>{item.dish.emoji}</Text>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.dish.name}</Text>
                    <Text style={styles.itemPrice}>
                      {item.dish.price * item.quantity} ₸
                    </Text>
                  </View>
                  <View style={styles.counter}>
                    <Pressable
                      style={styles.counterBtn}
                      onPress={() => updateQuantity(item.dish.id, -1)}
                    >
                      <Text style={styles.counterSign}>−</Text>
                    </Pressable>
                    <Text style={styles.counterVal}>{item.quantity}</Text>
                    <Pressable
                      style={styles.counterBtn}
                      onPress={() => updateQuantity(item.dish.id, 1)}
                    >
                      <Text style={styles.counterSign}>+</Text>
                    </Pressable>
                  </View>
                </View>
              )}
              ListFooterComponent={
                <View style={styles.formSection}>
                  <Text style={styles.label}>Адрес доставки</Text>
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Улица, дом, квартира"
                  />

                  <Text style={styles.label}>Комментарий курьеру</Text>
                  <TextInput
                    style={styles.input}
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Код домофона, этаж..."
                  />

                  <Text style={styles.label}>Способ оплаты</Text>
                  <View style={styles.payRow}>
                    <Pressable
                      style={[styles.payBtn, paymentMethod === 'card' && styles.payBtnActive]}
                      onPress={() => setPaymentMethod('card')}
                    >
                      <Text
                        style={[
                          styles.payText,
                          paymentMethod === 'card' && styles.payTextActive,
                        ]}
                      >
                        💳 Картой
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.payBtn, paymentMethod === 'cash' && styles.payBtnActive]}
                      onPress={() => setPaymentMethod('cash')}
                    >
                      <Text
                        style={[
                          styles.payText,
                          paymentMethod === 'cash' && styles.payTextActive,
                        ]}
                      >
                        💵 Наличными
                      </Text>
                    </Pressable>
                  </View>

                  <View style={styles.summary}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Блюда</Text>
                      <Text style={styles.summaryVal}>{totalPrice} ₸</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Доставка</Text>
                      <Text style={styles.summaryVal}>{deliveryFee} ₸</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Итого</Text>
                      <Text style={styles.totalVal}>{finalTotal} ₸</Text>
                    </View>
                  </View>
                </View>
              }
            />

            <Pressable style={styles.checkoutBtn} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>Заказать за {finalTotal} ₸</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  container: { flex: 1, padding: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: { fontSize: 16, color: '#16A34A', fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 54, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  goMenuBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
  },
  goMenuText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },
  itemEmoji: { fontSize: 30, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#16A34A', marginTop: 2 },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 6,
  },
  counterBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  counterSign: { fontSize: 18, fontWeight: '700' },
  counterVal: { fontSize: 15, fontWeight: '700', marginHorizontal: 6 },
  formSection: { marginTop: 12, paddingBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 15,
  },
  payRow: { flexDirection: 'row', gap: 10 },
  payBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  payBtnActive: { borderColor: '#16A34A', backgroundColor: '#ECFDF5' },
  payText: { fontWeight: '600', color: '#374151' },
  payTextActive: { color: '#16A34A', fontWeight: '700' },
  summary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: { color: '#6B7280', fontSize: 14 },
  summaryVal: { color: '#111827', fontWeight: '600', fontSize: 14 },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
    marginBottom: 0,
  },
  totalLabel: { fontSize: 16, fontWeight: '800', color: '#111827' },
  totalVal: { fontSize: 16, fontWeight: '800', color: '#16A34A' },
  checkoutBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});