import type { Dish, Size } from '@/api/types';
import { useCart } from '@/constants/cartcontext';
import { confirm } from '@/utils/dialog';

export function useAddToCart() {
  const { addToCart, replaceCart, items } = useCart();

  return async (dish: Dish, size?: Size | null, quantity = 1) => {
    if (addToCart(dish, size, quantity)) return true;
    const current = items[0]?.dish.restaurant ?? 'другого ресторана';
    const ok = await confirm(
      'Очистить корзину?',
      `В корзине блюда из «${current}». Заказ можно сделать только из одного ресторана.`,
      'Очистить',
    );
    if (ok) replaceCart(dish, size, quantity);
    return ok;
  };
}
