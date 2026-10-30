import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, Button } from 'react-native';

export default function App() {
  // Состояние для поиска
  const [search, setSearch] = useState('');
  // количества товаров в корзине
  const [cartCount, setCartCount] = useState(0);

  return (
    <View style={styles.container}>
      {/* Шапка */}
      <View style={styles.header}>
        <Text style={styles.title}>🍔 Моя еда</Text>
        <Text style={styles.cart}>Корзина: {cartCount}</Text>
      </View>

      {/* Поиск */}
      <TextInput
        style={styles.input}
        placeholder="Поиск еды..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Список блюд */}
      <ScrollView>
        {/* Карточка 1 */}
        <View style={styles.card}>
          <Text style={styles.foodName}>Бургер</Text>
          <Text style={styles.price}>2000 ₸</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => setCartCount(cartCount + 1)}
          >
            <Text style={styles.buttonText}>Добавить</Text>
          </TouchableOpacity>
        </View>

        {/* Карточка 2 */}
        <View style={styles.card}>
          <Text style={styles.foodName}>Пицца</Text>
          <Text style={styles.price}>3500 ₸</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => setCartCount(cartCount + 1)}
          >
            <Text style={styles.buttonText}>Добавить</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cart: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  foodName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: 'green',
    marginVertical: 5,
  },
  button: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
