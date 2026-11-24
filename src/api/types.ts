export type Role = 'customer' | 'chef';

export type OrderStatus = 'accepted' | 'cooking' | 'on_the_way' | 'delivered' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  bio?: string;
  role: Role;
  restaurantId?: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  image: string | null;
  minPrice: number;
}

export interface Ingredient {
  emoji: string;
  name: string;
}

export interface Size {
  id: string;
  label: string;
  extra: number;
}

export interface Dish {
  id: string;
  restaurantId: string;
  restaurant: string;
  category: string;
  name: string;
  price: number;
  emoji: string;
  image: string | null;
  description: string;
  rating: number;
  deliveryTime: string;
  ingredients: Ingredient[];
  sizes: Size[];
  popular: boolean;
  sold?: number;
  custom?: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  restaurantId: string;
  userName: string;
  rating: number;
  title: string;
  text: string;
  createdAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  tags: string[];
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  description: string;
}

export interface RestaurantDetail extends Restaurant {
  categories: Category[];
  menu: Dish[];
  reviews: Review[];
}

export interface Promo {
  code: string;
  percent: number;
  title: string;
}

export interface Address {
  id: string;
  label: 'home' | 'work' | 'other';
  street: string;
  apartment: string;
  comment: string;
}

export interface Card {
  id: string;
  holder: string;
  brand: string;
  last4: string;
  exp: string;
}

export interface OrderLine {
  dishId: string;
  name: string;
  emoji: string;
  image: string | null;
  size: string | null;
  price: number;
  quantity: number;
}

export interface OrderStep {
  status: OrderStatus;
  title: string;
  done: boolean;
  at: string | null;
}

export interface Order {
  id: string;
  number: number;
  customerName: string;
  restaurantId: string;
  restaurant: { id: string; name: string; image: string };
  items: OrderLine[];
  address: string;
  comment: string;
  payment: 'card' | 'cash';
  cardLast4: string | null;
  promoCode: string | null;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  courier: { name: string; phone: string; avatar: string };
  status: OrderStatus;
  statusTitle: string;
  steps: OrderStep[];
  canCancel: boolean;
  review: Review | null;
  createdAt: string;
}

export interface Message {
  id: string;
  orderId: string;
  from: 'me' | 'courier';
  text: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  orderId: string;
  title: string;
  text: string;
  status: OrderStatus;
  image: string;
  at: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ChefDashboard {
  restaurant: Restaurant;
  running: number;
  requests: number;
  revenueTotal: number;
  days: { day: string; revenue: number }[];
  rating: number;
  reviewsCount: number;
  popular: (Pick<Dish, 'id' | 'name' | 'emoji' | 'image'> & { sold: number })[];
  earned: number;
  withdrawn: number;
  balance: number;
}

export interface Withdrawal {
  id: string;
  amount: number;
  at: string;
}
