import crypto from 'node:crypto';
import os from 'node:os';
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { db, save } from './db.ts';
import { categories, couriers, courierReplies, dishes as seedDishes, faq, promos, restaurants } from './seed.ts';
import { checkPassword, createSession, hashPassword, publicUser, requireAuth, requireChef } from './auth.ts';
import type { AuthResponse } from './auth.ts';
import type { Address, Card, Dish, Order, OrderLine, OrderStatus, Restaurant, StatusEvent } from './types.ts';

const PORT = Number(process.env.PORT) || 4100;
const MIN = 60000;
const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

type Body = Record<string, unknown>;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const normEmail = (v: unknown) => String(v ?? '').trim().toLowerCase();
const text = (v: unknown) => String(v ?? '').trim();
const now = () => new Date().toISOString();
const body = (req: Request): Body => (req.body ?? {}) as Body;
const fail = (res: Response, status: number, error: string) => res.status(status).json({ error });

for (const r of restaurants) {
  const email = `chef@${r.id}.kz`;
  if (!db.users.some((u) => u.email === email)) {
    db.users.push({
      id: crypto.randomUUID(),
      name: `Шеф ${r.name}`,
      email,
      phone: '',
      address: '',
      role: 'chef',
      restaurantId: r.id,
      passwordHash: hashPassword('chef123'),
      createdAt: now(),
    });
  }
}
save();

const allDishes = (): Dish[] =>
  [...seedDishes, ...db.customDishes].filter((d) => !db.hiddenDishes.includes(d.id));

const findDish = (id: string) => allDishes().find((d) => d.id === id);

const restaurantById = (id: string): Restaurant => {
  const r = restaurants.find((x) => x.id === id);
  if (!r) throw new Error(`Нет ресторана ${id}`);
  return r;
};

const withRestaurant = (dish: Dish) => {
  const r = restaurantById(dish.restaurantId);
  return { ...dish, restaurant: r.name, rating: r.rating, deliveryTime: r.deliveryTime };
};

const reviewsOf = (restaurantId: string) => db.reviews.filter((r) => r.restaurantId === restaurantId);

const restaurantStats = (r: Restaurant) => {
  const list = reviewsOf(r.id);
  const rating = list.length
    ? Math.round(((r.rating * 20 + list.reduce((s, x) => s + x.rating, 0)) / (20 + list.length)) * 10) / 10
    : r.rating;
  return { ...r, rating, reviewsCount: 120 + list.length };
};

const STATUS_TITLES: Record<OrderStatus, string> = {
  accepted: 'Заказ принят',
  cooking: 'Готовится',
  on_the_way: 'Курьер в пути',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};
const FLOW: OrderStatus[] = ['accepted', 'cooking', 'on_the_way', 'delivered'];

const shift = (at: string, minutes: number) => new Date(Date.parse(at) + minutes * MIN).toISOString();

const timelineOf = (order: Order): StatusEvent[] => {
  const events = [...order.history];
  const last = () => events[events.length - 1];
  const age = () => Date.now() - Date.parse(last().at);
  if (last().status === 'cancelled') return events;
  if (!order.chefControlled) {
    if (last().status === 'accepted' && age() >= 1 * MIN) events.push({ status: 'cooking', at: shift(last().at, 1) });
    if (last().status === 'cooking' && age() >= 2 * MIN) events.push({ status: 'on_the_way', at: shift(last().at, 2) });
  }
  if (last().status === 'on_the_way' && age() >= 3 * MIN) events.push({ status: 'delivered', at: shift(last().at, 3) });
  return events;
};

const withStatus = (order: Order) => {
  const events = timelineOf(order);
  const status = events[events.length - 1].status;
  const steps = FLOW.map((s) => {
    const ev = events.find((e) => e.status === s);
    return { status: s, title: STATUS_TITLES[s], done: !!ev, at: ev?.at ?? null };
  });
  const r = restaurantById(order.restaurantId);
  return {
    ...order,
    restaurant: { id: r.id, name: r.name, image: r.image },
    status,
    statusTitle: STATUS_TITLES[status],
    steps,
    canCancel: status === 'accepted',
    review: db.reviews.find((x) => x.orderId === order.id) ?? null,
  };
};

const persistStatus = (order: Order) => {
  const events = timelineOf(order);
  if (events.length !== order.history.length) {
    order.history = events;
    save();
  }
};

const ownOrder = (req: Request, res: AuthResponse): Order | undefined => {
  const order = db.orders.find((o) => o.id === req.params.id && o.userId === res.locals.user.id);
  if (!order) fail(res, 404, 'Заказ не найден');
  return order;
};

const luhn = (num: string) => {
  let sum = 0;
  [...num].reverse().forEach((ch, i) => {
    let d = Number(ch);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  });
  return sum % 10 === 0;
};

const cardBrand = (num: string) => {
  if (num.startsWith('4')) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'Mastercard';
  return 'Карта';
};

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/auth/register', (req, res) => {
  const b = body(req);
  const name = text(b.name);
  const email = normEmail(b.email);
  const password = String(b.password ?? '');
  if (!name) return fail(res, 400, 'Введите имя');
  if (!isEmail(email)) return fail(res, 400, 'Неверный формат email');
  if (password.length < 6) return fail(res, 400, 'Пароль минимум 6 символов');
  if (db.users.some((u) => u.email === email)) return fail(res, 409, 'Аккаунт с таким email уже есть');
  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    phone: '',
    address: '',
    bio: '',
    role: 'customer' as const,
    passwordHash: hashPassword(password),
    createdAt: now(),
  };
  db.users.push(user);
  save();
  res.status(201).json({ token: createSession(user.id), user: publicUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const b = body(req);
  const user = db.users.find((u) => u.email === normEmail(b.email));
  if (!user || !checkPassword(String(b.password ?? ''), user.passwordHash)) {
    return fail(res, 401, 'Неверный email или пароль');
  }
  res.json({ token: createSession(user.id), user: publicUser(user) });
});

app.post('/api/auth/logout', requireAuth, (req, res: AuthResponse) => {
  db.sessions = db.sessions.filter((s) => s.token !== res.locals.token);
  save();
  res.json({ ok: true });
});

app.get('/api/auth/me', requireAuth, (req, res: AuthResponse) => {
  res.json({ user: publicUser(res.locals.user) });
});

app.patch('/api/auth/me', requireAuth, (req, res: AuthResponse) => {
  const b = body(req);
  const user = res.locals.user;
  if (typeof b.name === 'string') user.name = b.name.trim();
  if (typeof b.phone === 'string') user.phone = b.phone.trim();
  if (typeof b.address === 'string') user.address = b.address.trim();
  if (typeof b.bio === 'string') user.bio = b.bio.trim();
  if (!user.name) return fail(res, 400, 'Имя не может быть пустым');
  save();
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/forgot', (req, res) => {
  const email = normEmail(body(req).email);
  if (!isEmail(email)) return fail(res, 400, 'Неверный формат email');
  if (!db.users.some((u) => u.email === email)) return fail(res, 404, 'Аккаунт с таким email не найден');
  const code = String(crypto.randomInt(1000, 10000));
  db.resetCodes = db.resetCodes.filter((c) => c.email !== email);
  db.resetCodes.push({ email, code, expiresAt: Date.now() + 10 * MIN });
  save();
  console.log(`Код восстановления для ${email}: ${code}`);
  res.json({ ok: true, devCode: code });
});

const validCode = (email: string, code: unknown) => {
  const entry = db.resetCodes.find((c) => c.email === email);
  return !!entry && entry.code === String(code) && entry.expiresAt > Date.now();
};

app.post('/api/auth/verify', (req, res) => {
  const b = body(req);
  if (!validCode(normEmail(b.email), b.code)) return fail(res, 400, 'Неверный или устаревший код');
  res.json({ ok: true });
});

app.post('/api/auth/reset', (req, res) => {
  const b = body(req);
  const email = normEmail(b.email);
  const password = String(b.password ?? '');
  const user = db.users.find((u) => u.email === email);
  if (!user || !validCode(email, b.code)) return fail(res, 400, 'Неверный или устаревший код');
  if (password.length < 6) return fail(res, 400, 'Пароль минимум 6 символов');
  user.passwordHash = hashPassword(password);
  db.resetCodes = db.resetCodes.filter((c) => c.email !== email);
  db.sessions = db.sessions.filter((s) => s.userId !== user.id);
  save();
  res.json({ token: createSession(user.id), user: publicUser(user) });
});

app.get('/api/categories', (req, res) => {
  res.json(
    categories.map((c) => {
      const list = allDishes().filter((d) => d.category === c.id);
      return {
        ...c,
        image: list.find((d) => d.image)?.image ?? null,
        minPrice: list.length ? Math.min(...list.map((d) => d.price)) : 0,
      };
    }),
  );
});

app.get('/api/restaurants', (req, res) => {
  const category = text(req.query.category);
  const list = restaurants
    .filter((r) => !category || allDishes().some((d) => d.restaurantId === r.id && d.category === category))
    .map(restaurantStats);
  res.json(list);
});

app.get('/api/restaurants/:id', (req, res) => {
  const restaurant = restaurants.find((r) => r.id === req.params.id);
  if (!restaurant) return fail(res, 404, 'Ресторан не найден');
  const menu = allDishes().filter((d) => d.restaurantId === restaurant.id).map(withRestaurant);
  res.json({
    ...restaurantStats(restaurant),
    categories: categories.filter((c) => menu.some((d) => d.category === c.id)),
    menu,
    reviews: reviewsOf(restaurant.id).slice(-10).reverse(),
  });
});

app.get('/api/dishes', (req, res) => {
  const q = text(req.query.q).toLowerCase();
  const category = text(req.query.category);
  const popular = req.query.popular === '1';
  const list = allDishes()
    .map(withRestaurant)
    .filter((d) => {
      const categoryName = categories.find((c) => c.id === d.category)?.name.toLowerCase() ?? '';
      const bySearch =
        !q || d.name.toLowerCase().includes(q) || d.restaurant.toLowerCase().includes(q) || categoryName.includes(q);
      return (!category || d.category === category) && bySearch && (!popular || d.popular);
    });
  res.json(list);
});

app.get('/api/dishes/:id', (req, res) => {
  const dish = findDish(String(req.params.id));
  if (!dish) return fail(res, 404, 'Блюдо не найдено');
  res.json(withRestaurant(dish));
});

app.get('/api/promos/:code', (req, res) => {
  const promo = promos.find((p) => p.code === text(req.params.code).toUpperCase());
  if (!promo) return fail(res, 404, 'Промокод не найден');
  res.json(promo);
});

app.get('/api/faq', (req, res) => {
  res.json(faq);
});

app.get('/api/favorites', requireAuth, (req, res: AuthResponse) => {
  const ids = db.favorites.filter((f) => f.userId === res.locals.user.id).map((f) => f.dishId);
  res.json(ids.map(findDish).filter((d): d is Dish => !!d).map(withRestaurant));
});

app.post('/api/favorites/:dishId', requireAuth, (req, res: AuthResponse) => {
  const dishId = String(req.params.dishId);
  if (!findDish(dishId)) return fail(res, 404, 'Блюдо не найдено');
  const userId = res.locals.user.id;
  if (!db.favorites.some((f) => f.userId === userId && f.dishId === dishId)) {
    db.favorites.push({ userId, dishId });
    save();
  }
  res.json({ ok: true });
});

app.delete('/api/favorites/:dishId', requireAuth, (req, res: AuthResponse) => {
  const userId = res.locals.user.id;
  db.favorites = db.favorites.filter((f) => !(f.userId === userId && f.dishId === req.params.dishId));
  save();
  res.json({ ok: true });
});

const addressBody = (b: Body): Omit<Address, 'id' | 'userId'> => ({
  label: b.label === 'home' || b.label === 'work' ? b.label : 'other',
  street: text(b.street),
  apartment: text(b.apartment),
  comment: text(b.comment),
});

app.get('/api/addresses', requireAuth, (req, res: AuthResponse) => {
  res.json(db.addresses.filter((a) => a.userId === res.locals.user.id));
});

app.post('/api/addresses', requireAuth, (req, res: AuthResponse) => {
  const data = addressBody(body(req));
  if (!data.street) return fail(res, 400, 'Укажите улицу и дом');
  const address: Address = { id: crypto.randomUUID(), userId: res.locals.user.id, ...data };
  db.addresses.push(address);
  if (!res.locals.user.address) res.locals.user.address = data.street;
  save();
  res.status(201).json(address);
});

app.patch('/api/addresses/:id', requireAuth, (req, res: AuthResponse) => {
  const address = db.addresses.find((a) => a.id === req.params.id && a.userId === res.locals.user.id);
  if (!address) return fail(res, 404, 'Адрес не найден');
  const data = addressBody({ ...address, ...body(req) });
  if (!data.street) return fail(res, 400, 'Укажите улицу и дом');
  Object.assign(address, data);
  save();
  res.json(address);
});

app.delete('/api/addresses/:id', requireAuth, (req, res: AuthResponse) => {
  const userId = res.locals.user.id;
  db.addresses = db.addresses.filter((a) => !(a.id === req.params.id && a.userId === userId));
  save();
  res.json({ ok: true });
});

app.get('/api/cards', requireAuth, (req, res: AuthResponse) => {
  res.json(db.cards.filter((c) => c.userId === res.locals.user.id));
});

app.post('/api/cards', requireAuth, (req, res: AuthResponse) => {
  const b = body(req);
  const holder = text(b.holder);
  const number = String(b.number ?? '').replace(/\D/g, '');
  const exp = text(b.exp);
  const cvc = String(b.cvc ?? '').replace(/\D/g, '');
  if (!holder) return fail(res, 400, 'Введите имя владельца карты');
  if (number.length !== 16 || !luhn(number)) return fail(res, 400, 'Неверный номер карты');
  const m = exp.match(/^(\d{2})\/(\d{2})$/);
  const month = m ? Number(m[1]) : 0;
  if (!m || month < 1 || month > 12 || new Date(2000 + Number(m[2]), month, 1) <= new Date()) {
    return fail(res, 400, 'Неверный срок действия');
  }
  if (cvc.length !== 3) return fail(res, 400, 'CVC — 3 цифры');
  const card: Card = {
    id: crypto.randomUUID(),
    userId: res.locals.user.id,
    holder,
    brand: cardBrand(number),
    last4: number.slice(-4),
    exp,
  };
  db.cards.push(card);
  save();
  res.status(201).json(card);
});

app.delete('/api/cards/:id', requireAuth, (req, res: AuthResponse) => {
  const userId = res.locals.user.id;
  db.cards = db.cards.filter((c) => !(c.id === req.params.id && c.userId === userId));
  save();
  res.json({ ok: true });
});

app.post('/api/orders', requireAuth, (req, res: AuthResponse) => {
  const b = body(req);
  const user = res.locals.user;
  const items = Array.isArray(b.items) ? (b.items as Body[]) : [];
  if (items.length === 0) return fail(res, 400, 'Корзина пуста');
  if (!text(b.address)) return fail(res, 400, 'Укажите адрес доставки');

  const lines: OrderLine[] = [];
  for (const item of items) {
    const dish = findDish(text(item.dishId));
    const quantity = Math.floor(Number(item.quantity));
    if (!dish || !(quantity > 0)) return fail(res, 400, 'Неверный состав заказа');
    const sizes = dish.sizes ?? [];
    const size = sizes.find((s) => s.id === item.sizeId) ?? sizes[0] ?? null;
    lines.push({
      dishId: dish.id,
      restaurantId: dish.restaurantId,
      name: dish.name,
      emoji: dish.emoji,
      image: dish.image,
      size: size?.label ?? null,
      price: dish.price + (size?.extra ?? 0),
      quantity,
    });
  }

  const restaurantIds = [...new Set(lines.map((l) => l.restaurantId))];
  if (restaurantIds.length > 1) return fail(res, 400, 'В одном заказе — блюда только одного ресторана');
  const restaurant = restaurantById(restaurantIds[0]);

  let card: Card | undefined;
  if (b.payment === 'card') {
    card = db.cards.find((c) => c.id === b.cardId && c.userId === user.id);
    if (!card) return fail(res, 400, 'Выберите карту для оплаты');
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const promoCode = text(b.promoCode).toUpperCase();
  const promo = promoCode ? promos.find((p) => p.code === promoCode) : undefined;
  if (promoCode && !promo) return fail(res, 400, 'Промокод не найден');
  const discount = promo ? Math.round((subtotal * promo.percent) / 100) : 0;

  const order: Order = {
    id: crypto.randomUUID(),
    number: 1000 + db.orders.length + 1,
    userId: user.id,
    customerName: user.name,
    restaurantId: restaurant.id,
    items: lines,
    address: text(b.address),
    comment: text(b.comment),
    payment: card ? 'card' : 'cash',
    cardLast4: card?.last4 ?? null,
    promoCode: promo?.code ?? null,
    subtotal,
    deliveryFee: restaurant.deliveryFee,
    discount,
    total: subtotal + restaurant.deliveryFee - discount,
    courier: couriers[db.orders.length % couriers.length],
    chefControlled: false,
    history: [{ status: 'accepted', at: now() }],
    createdAt: now(),
  };
  db.orders.push(order);
  if (!user.address) user.address = order.address;
  save();
  res.status(201).json(withStatus(order));
});

app.get('/api/orders', requireAuth, (req, res: AuthResponse) => {
  const list = db.orders
    .filter((o) => o.userId === res.locals.user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  list.forEach(persistStatus);
  res.json(list.map(withStatus));
});

app.get('/api/orders/:id', requireAuth, (req, res: AuthResponse) => {
  const order = ownOrder(req, res);
  if (!order) return;
  persistStatus(order);
  res.json(withStatus(order));
});

app.post('/api/orders/:id/cancel', requireAuth, (req, res: AuthResponse) => {
  const order = ownOrder(req, res);
  if (!order) return;
  persistStatus(order);
  if (!withStatus(order).canCancel) return fail(res, 400, 'Заказ уже готовится — отменить нельзя');
  order.history.push({ status: 'cancelled', at: now() });
  save();
  res.json(withStatus(order));
});

app.post('/api/orders/:id/review', requireAuth, (req, res: AuthResponse) => {
  const order = ownOrder(req, res);
  if (!order) return;
  const b = body(req);
  if (withStatus(order).status !== 'delivered') return fail(res, 400, 'Оценить можно только доставленный заказ');
  const rating = Math.round(Number(b.rating));
  if (!(rating >= 1 && rating <= 5)) return fail(res, 400, 'Поставьте оценку от 1 до 5');
  if (db.reviews.some((r) => r.orderId === order.id)) return fail(res, 409, 'Вы уже оценили этот заказ');
  const review = {
    id: crypto.randomUUID(),
    orderId: order.id,
    restaurantId: order.restaurantId,
    userName: res.locals.user.name,
    rating,
    title: text(b.title) || (rating >= 4 ? 'Отличная еда и доставка' : 'Можно лучше'),
    text: text(b.text),
    createdAt: now(),
  };
  db.reviews.push(review);
  save();
  res.status(201).json(review);
});

app.get('/api/orders/:id/messages', requireAuth, (req, res: AuthResponse) => {
  const order = ownOrder(req, res);
  if (!order) return;
  res.json(db.messages.filter((m) => m.orderId === order.id));
});

app.post('/api/orders/:id/messages', requireAuth, (req, res: AuthResponse) => {
  const order = ownOrder(req, res);
  if (!order) return;
  const message = text(body(req).text);
  if (!message) return fail(res, 400, 'Пустое сообщение');
  const saved = { id: crypto.randomUUID(), orderId: order.id, from: 'me' as const, text: message, createdAt: now() };
  db.messages.push(saved);
  save();
  const count = db.messages.filter((m) => m.orderId === order.id && m.from === 'courier').length;
  setTimeout(() => {
    db.messages.push({
      id: crypto.randomUUID(),
      orderId: order.id,
      from: 'courier',
      text: courierReplies[count % courierReplies.length],
      createdAt: now(),
    });
    save();
  }, 2500);
  res.status(201).json(saved);
});

app.get('/api/notifications', requireAuth, (req, res: AuthResponse) => {
  const list = db.orders
    .filter((o) => o.userId === res.locals.user.id)
    .flatMap((o) => {
      const r = restaurantById(o.restaurantId);
      return timelineOf(o).map((e) => ({
        id: `${o.id}-${e.status}`,
        orderId: o.id,
        title: `${r.name} · заказ №${o.number}`,
        text: STATUS_TITLES[e.status],
        status: e.status,
        image: r.image,
        at: e.at,
      }));
    })
    .sort((a, b) => b.at.localeCompare(a.at));
  res.json(list);
});

const chefRestaurantId = (res: AuthResponse) => res.locals.user.restaurantId ?? '';

const chefOrders = (res: AuthResponse) =>
  db.orders
    .filter((o) => o.restaurantId === chefRestaurantId(res))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

const chefBalance = (res: AuthResponse) => {
  const earned = chefOrders(res)
    .filter((o) => withStatus(o).status === 'delivered')
    .reduce((s, o) => s + Math.round(o.subtotal * 0.85), 0);
  const withdrawn = db.withdrawals
    .filter((w) => w.restaurantId === chefRestaurantId(res))
    .reduce((s, w) => s + w.amount, 0);
  return { earned, withdrawn, balance: earned - withdrawn };
};

app.get('/api/chef/dashboard', requireChef, (req, res: AuthResponse) => {
  const orders = chefOrders(res);
  orders.forEach(persistStatus);
  const list = orders.map(withStatus);
  const active = list.filter((o) => o.status !== 'cancelled');
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (6 - i));
    const from = d.getTime();
    const to = from + 24 * 60 * MIN;
    const revenue = active
      .filter((o) => Date.parse(o.createdAt) >= from && Date.parse(o.createdAt) < to)
      .reduce((s, o) => s + o.subtotal, 0);
    return { day: d.toISOString(), revenue };
  });
  const sold: Record<string, number> = {};
  active.forEach((o) => o.items.forEach((i) => (sold[i.dishId] = (sold[i.dishId] ?? 0) + i.quantity)));
  const popular = Object.entries(sold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, qty]) => ({ ...(findDish(id) ?? { id, name: 'Удалённое блюдо', emoji: '🍽️', image: null }), sold: qty }));
  const restaurant = restaurantStats(restaurantById(chefRestaurantId(res)));
  res.json({
    restaurant,
    running: list.filter((o) => o.status === 'cooking').length,
    requests: list.filter((o) => o.status === 'accepted').length,
    revenueTotal: days.reduce((s, d) => s + d.revenue, 0),
    days,
    rating: restaurant.rating,
    reviewsCount: reviewsOf(restaurant.id).length,
    popular,
    ...chefBalance(res),
  });
});

app.get('/api/chef/orders', requireChef, (req, res: AuthResponse) => {
  const orders = chefOrders(res);
  orders.forEach(persistStatus);
  const status = text(req.query.status);
  res.json(orders.map(withStatus).filter((o) => !status || o.status === status));
});

const CHEF_MOVES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  accepted: ['cooking', 'cancelled'],
  cooking: ['on_the_way', 'cancelled'],
};

app.post('/api/chef/orders/:id/status', requireChef, (req, res: AuthResponse) => {
  const order = db.orders.find((o) => o.id === req.params.id && o.restaurantId === chefRestaurantId(res));
  if (!order) return fail(res, 404, 'Заказ не найден');
  persistStatus(order);
  const current = withStatus(order).status;
  const next = text(body(req).status) as OrderStatus;
  if (!(CHEF_MOVES[current] ?? []).includes(next)) {
    return fail(res, 400, `Нельзя перевести заказ из «${STATUS_TITLES[current]}» в «${STATUS_TITLES[next] ?? next}»`);
  }
  order.chefControlled = true;
  order.history.push({ status: next, at: now() });
  save();
  res.json(withStatus(order));
});

app.get('/api/chef/dishes', requireChef, (req, res: AuthResponse) => {
  const sold: Record<string, number> = {};
  chefOrders(res).forEach((o) => o.items.forEach((i) => (sold[i.dishId] = (sold[i.dishId] ?? 0) + i.quantity)));
  res.json(
    allDishes()
      .filter((d) => d.restaurantId === chefRestaurantId(res))
      .map((d) => ({ ...withRestaurant(d), sold: sold[d.id] ?? 0, custom: d.id.startsWith('c') })),
  );
});

app.post('/api/chef/dishes', requireChef, (req, res: AuthResponse) => {
  const b = body(req);
  const name = text(b.name);
  const price = Math.round(Number(b.price));
  const category = categories.find((c) => c.id === text(b.category));
  if (!name) return fail(res, 400, 'Введите название блюда');
  if (!(price > 0)) return fail(res, 400, 'Укажите цену');
  if (!category) return fail(res, 400, 'Выберите категорию');
  const image = text(b.image);
  const ingredients = Array.isArray(b.ingredients) ? (b.ingredients as Body[]) : [];
  const dish: Dish = {
    id: `c${Date.now()}`,
    restaurantId: chefRestaurantId(res),
    category: category.id,
    name,
    price,
    emoji: text(b.emoji) || category.emoji,
    image: /^https?:\/\//.test(image) ? image : null,
    description: text(b.description),
    ingredients: ingredients
      .slice(0, 12)
      .map((i) => ({ emoji: text(i.emoji) || '•', name: text(i.name) }))
      .filter((i) => i.name),
    sizes: [],
    popular: false,
  };
  db.customDishes.push(dish);
  save();
  res.status(201).json(withRestaurant(dish));
});

app.delete('/api/chef/dishes/:id', requireChef, (req, res: AuthResponse) => {
  const dish = findDish(String(req.params.id));
  if (!dish || dish.restaurantId !== chefRestaurantId(res)) return fail(res, 404, 'Блюдо не найдено');
  if (dish.id.startsWith('c')) db.customDishes = db.customDishes.filter((d) => d.id !== dish.id);
  else db.hiddenDishes.push(dish.id);
  save();
  res.json({ ok: true });
});

app.get('/api/chef/reviews', requireChef, (req, res: AuthResponse) => {
  res.json(reviewsOf(chefRestaurantId(res)).slice().reverse());
});

app.post('/api/chef/withdraw', requireChef, (req, res: AuthResponse) => {
  const { balance } = chefBalance(res);
  const amount = Math.round(Number(body(req).amount ?? balance));
  if (!(amount > 0) || amount > balance) return fail(res, 400, 'Недостаточно средств');
  db.withdrawals.push({ id: crypto.randomUUID(), restaurantId: chefRestaurantId(res), amount, at: now() });
  save();
  res.json({ ok: true, amount, ...chefBalance(res) });
});

app.get('/api/chef/withdrawals', requireChef, (req, res: AuthResponse) => {
  res.json(db.withdrawals.filter((w) => w.restaurantId === chefRestaurantId(res)).reverse());
});

app.use((req, res) => {
  fail(res, 404, 'Не найдено');
});

app.listen(PORT, '0.0.0.0', () => {
  const ips = Object.values(os.networkInterfaces())
    .flat()
    .filter((n) => n && n.family === 'IPv4' && !n.internal)
    .map((n) => n?.address);
  console.log(`FoodGo API запущен: http://localhost:${PORT}`);
  ips.forEach((ip) => console.log(`Для телефона в той же Wi-Fi сети: http://${ip}:${PORT}`));
  console.log('Вход для ресторанов: chef@<id ресторана>.kz / chef123, например chef@burger-lab.kz');
});
