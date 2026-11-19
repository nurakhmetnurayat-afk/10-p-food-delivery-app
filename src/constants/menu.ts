export interface Dish {
  id: string;
  name: string;
  restaurant: string;
  category: 'Бургеры' | 'Пицца' | 'Суши' | 'Напитки';
  price: number;
  rating: number;
  deliveryTime: string;
  description: string;
  emoji: string;
}

export const CATEGORIES = ['Все', 'Бургеры', 'Пицца', 'Суши', 'Напитки'] as const;

export const DISHES: Dish[] = [
  {
    id: '1',
    name: 'Двойной Чизбургер Делюкс',
    restaurant: 'Burger Lab',
    category: 'Бургеры',
    price: 2490,
    rating: 4.8,
    deliveryTime: '25–35 мин',
    description: 'Две говяжьи котлеты, сыр чеддер, маринованные огурцы и фирменный соус.',
    emoji: '🍔',
  },
  {
    id: '2',
    name: 'Пепперони на тонком тесте',
    restaurant: 'Roma Pizza',
    category: 'Пицца',
    price: 3890,
    rating: 4.9,
    deliveryTime: '30–40 мин',
    description: 'Моцарелла, острая колбаса пепперони, томатный соус с базиликом.',
    emoji: '🍕',
  },
  {
    id: '3',
    name: 'Сет Филадельфия Классик',
    restaurant: 'Tokyo Roll',
    category: 'Суши',
    price: 4590,
    rating: 4.7,
    deliveryTime: '35–45 мин',
    description: 'Лосось, сливочный сыр, огурец, рис и нори (8 шт.).',
    emoji: '🍣',
  },
  {
    id: '4',
    name: 'Куриный Чикенбургер BBQ',
    restaurant: 'Burger Lab',
    category: 'Бургеры',
    price: 2190,
    rating: 4.6,
    deliveryTime: '20–30 мин',
    description: 'Хрустящее куриное филе, салат айсберг, бекон и соус барбекю.',
    emoji: '🍗',
  },
  {
    id: '5',
    name: 'Четыре Сыра',
    restaurant: 'Roma Pizza',
    category: 'Пицца',
    price: 4190,
    rating: 4.8,
    deliveryTime: '30–40 мин',
    description: 'Моцарелла, пармезан, дорблю и чеддер на сливочной основе.',
    emoji: '🧀',
  },
  {
    id: '6',
    name: 'Домашний Лимонад Манго-Маракуйя',
    restaurant: 'Fresh Bar',
    category: 'Напитки',
    price: 1190,
    rating: 4.9,
    deliveryTime: '15–20 мин',
    description: 'Освежающий напиток из натурального пюре манго и маракуйи, 500 мл.',
    emoji: '🥤',
  },
];