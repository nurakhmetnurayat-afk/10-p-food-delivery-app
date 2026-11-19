import React, { createContext, useContext, useState } from 'react';
import { Dish } from './menu';

export interface CartItem {
  dish: Dish;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  address: string;
  setAddress: (addr: string) => void;
  addToCart: (dish: Dish) => void;
  removeFromCart: (dishId: string) => void;
  updateQuantity: (dishId: string, delta: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState('ул. Абая, 44');

  const addToCart = (dish: Dish) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.dish.id === dish.id);
      if (existing) {
        return prev.map((i) =>
          i.dish.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { dish, quantity: 1 }];
    });
  };

  const updateQuantity = (dishId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.dish.id === dishId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (dishId: string) => {
    setItems((prev) => prev.filter((i) => i.dish.id !== dishId));
  };

  const clearCart = () => setItems([]);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.dish.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        address,
        setAddress,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart должен использоваться внутри CartProvider');
  }
  return ctx;
}