import React, { createContext, useContext, useState } from 'react';
import type { Dish, Promo, Size } from '@/api/types';

export interface CartItem {
  key: string;
  dish: Dish;
  size: Size | null;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  address: string;
  setAddress: (addr: string) => void;
  promo: Promo | null;
  setPromo: (promo: Promo | null) => void;
  addToCart: (dish: Dish, size?: Size | null, quantity?: number) => boolean;
  replaceCart: (dish: Dish, size?: Size | null, quantity?: number) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, delta: number) => void;
  quantityOf: (dishId: string) => number;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
  discount: number;
}

const CartContext = createContext<CartContextType | null>(null);

const makeItem = (dish: Dish, size: Size | null, quantity: number): CartItem => ({
  key: `${dish.id}:${size?.id ?? 'base'}`,
  dish,
  size,
  price: dish.price + (size?.extra ?? 0),
  quantity,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState('');
  const [promo, setPromo] = useState<Promo | null>(null);

  const restaurantId = items[0]?.dish.restaurantId ?? null;

  const addToCart = (dish: Dish, size: Size | null = dish.sizes[0] ?? null, quantity = 1) => {
    if (restaurantId && restaurantId !== dish.restaurantId) return false;
    const item = makeItem(dish, size, quantity);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === item.key);
      if (existing) {
        return prev.map((i) => (i.key === item.key ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, item];
    });
    return true;
  };

  const replaceCart = (dish: Dish, size: Size | null = dish.sizes[0] ?? null, quantity = 1) => {
    setItems([makeItem(dish, size, quantity)]);
    setPromo(null);
  };

  const updateQuantity = (key: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0),
    );
  };

  const removeFromCart = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  const quantityOf = (dishId: string) =>
    items.filter((i) => i.dish.id === dishId).reduce((sum, i) => sum + i.quantity, 0);

  const clearCart = () => {
    setItems([]);
    setPromo(null);
  };

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = promo ? Math.round((totalPrice * promo.percent) / 100) : 0;

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        address,
        setAddress,
        promo,
        setPromo,
        addToCart,
        replaceCart,
        removeFromCart,
        updateQuantity,
        quantityOf,
        clearCart,
        totalCount,
        totalPrice,
        discount,
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
