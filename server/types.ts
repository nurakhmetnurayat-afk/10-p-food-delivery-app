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
  passwordHash: string;
  createdAt: string;
}

export type PublicUser = Omit<User, 'passwordHash'>;

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface Restaurant {
  id: string;
  name: string;
  tags: string[];
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  description?: string;
  categories?: string[];
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
  category: string;
  name: string;
  price: number;
  emoji: string;
  image: string | null;
  description: string;
  ingredients?: Ingredient[];
  sizes?: Size[];
  popular?: boolean;
}

export interface Promo {
  code: string;
  percent: number;
  title: string;
}

export interface Courier {
  name: string;
  phone: string;
  avatar: string;
}

export interface OrderLine {
  dishId: string;
  restaurantId: string;
  name: string;
  emoji: string;
  image: string | null;
  size: string | null;
  price: number;
  quantity: number;
}

export interface StatusEvent {
  status: OrderStatus;
  at: string;
}

export interface Order {
  id: string;
  number: number;
  userId: string;
  customerName: string;
  restaurantId: string;
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
  courier: Courier;
  chefControlled: boolean;
  history: StatusEvent[];
  createdAt: string;
}

export interface ResetCode {
  email: string;
  code: string;
  expiresAt: number;
}

export interface Favorite {
  userId: string;
  dishId: string;
}

export interface Address {
  id: string;
  userId: string;
  label: 'home' | 'work' | 'other';
  street: string;
  apartment: string;
  comment: string;
}

export interface Card {
  id: string;
  userId: string;
  holder: string;
  brand: string;
  last4: string;
  exp: string;
}

export interface Message {
  id: string;
  orderId: string;
  from: 'me' | 'courier';
  text: string;
  createdAt: string;
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

export interface Withdrawal {
  id: string;
  restaurantId: string;
  amount: number;
  at: string;
}

export interface Database {
  users: User[];
  sessions: Session[];
  orders: Order[];
  resetCodes: ResetCode[];
  favorites: Favorite[];
  addresses: Address[];
  cards: Card[];
  messages: Message[];
  reviews: Review[];
  customDishes: Dish[];
  hiddenDishes: string[];
  withdrawals: Withdrawal[];
}

export interface AuthLocals {
  user: User;
  token: string;
}
