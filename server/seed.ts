import type { Category, Courier, Dish, Promo, Restaurant, Size } from './types.ts';

const img = (file: string): string => `https://www.themealdb.com/images/media/meals/${file}`;

export const categories: Category[] = [
  { id: 'burgers', name: 'Бургеры', emoji: '🍔' },
  { id: 'pizza', name: 'Пицца и паста', emoji: '🍕' },
  { id: 'asia', name: 'Азия', emoji: '🍣' },
  { id: 'east', name: 'Восточная кухня', emoji: '🥙' },
  { id: 'desserts', name: 'Десерты', emoji: '🍰' },
  { id: 'drinks', name: 'Напитки', emoji: '🥤' },
];

export const restaurants: Restaurant[] = [
  {
    id: 'burger-lab',
    name: 'Burger Lab',
    tags: ['Бургеры', 'Крылья', 'Фри'],
    rating: 4.8,
    deliveryTime: '25–35 мин',
    deliveryFee: 0,
    image: img('44bzep1761848278.jpg'),
  },
  {
    id: 'roma-pizza',
    name: 'Roma Pizza',
    tags: ['Пицца', 'Паста', 'Десерты'],
    rating: 4.9,
    deliveryTime: '30–40 мин',
    deliveryFee: 500,
    image: img('x0lk931587671540.jpg'),
  },
  {
    id: 'tokyo-roll',
    name: 'Tokyo Roll',
    tags: ['Суши', 'Рамен', 'Вок'],
    rating: 4.7,
    deliveryTime: '35–45 мин',
    deliveryFee: 500,
    image: img('g046bb1663960946.jpg'),
  },
  {
    id: 'dastarkhan',
    name: 'Дастархан',
    tags: ['Плов', 'Кебаб', 'Шаурма'],
    rating: 4.9,
    deliveryTime: '30–40 мин',
    deliveryFee: 0,
    image: img('kos9av1699014767.jpg'),
  },
  {
    id: 'sweet-day',
    name: 'Sweet Day',
    tags: ['Торты', 'Блины', 'Кофе'],
    rating: 4.6,
    deliveryTime: '20–30 мин',
    deliveryFee: 300,
    image: img('vrspxv1511722107.jpg'),
  },
];

export const dishes: Dish[] = [
  { id: 'd1', restaurantId: 'burger-lab', category: 'burgers', name: 'Классический бургер', price: 2290, emoji: '🍔', image: img('44bzep1761848278.jpg'), description: 'Говяжья котлета, сыр чеддер, свежие овощи и фирменный соус.' },
  { id: 'd2', restaurantId: 'burger-lab', category: 'burgers', name: 'Бургер с бараниной и дзадзики', price: 2690, emoji: '🍔', image: img('k420tj1585565244.jpg'), description: 'Котлета из баранины, соус дзадзики, красный лук и руккола.' },
  { id: 'd3', restaurantId: 'burger-lab', category: 'burgers', name: 'Чикен бургер с халуми', price: 2490, emoji: '🍗', image: img('vdwloy1713225718.jpg'), description: 'Куриное филе на гриле, жареный сыр халуми и печёный перец.' },
  { id: 'd4', restaurantId: 'burger-lab', category: 'burgers', name: 'Кёфте бургер', price: 2390, emoji: '🍔', image: img('lgmnff1763789847.jpg'), description: 'Пряная котлета кёфте, томаты, огурцы и йогуртовый соус.' },
  { id: 'd5', restaurantId: 'burger-lab', category: 'burgers', name: 'Хрустящие крылья', price: 1990, emoji: '🍗', image: img('feh9k21784665694.jpg'), description: '8 куриных крыльев в хрустящей панировке и соус на выбор.' },
  { id: 'd6', restaurantId: 'burger-lab', category: 'burgers', name: 'Картофель по-деревенски', price: 890, emoji: '🍟', image: img('j223gc1784579841.jpg'), description: 'Запечённые дольки с травами и чесночным соусом.' },

  { id: 'd7', restaurantId: 'roma-pizza', category: 'pizza', name: 'Маргарита', price: 3290, emoji: '🍕', image: img('x0lk931587671540.jpg'), description: 'Томатный соус, моцарелла и свежий базилик на тонком тесте.' },
  { id: 'd8', restaurantId: 'roma-pizza', category: 'pizza', name: 'Лазанья', price: 3490, emoji: '🍝', image: img('rvxxuy1468312893.jpg'), description: 'Слои пасты, овощной соус и запечённая сырная корочка.' },
  { id: 'd9', restaurantId: 'roma-pizza', category: 'pizza', name: 'Средиземноморский салат с пастой', price: 2190, emoji: '🥗', image: img('wvqpwt1468339226.jpg'), description: 'Паста, томаты черри, оливки, моцарелла и песто.' },
  { id: 'd10', restaurantId: 'roma-pizza', category: 'desserts', name: 'Чизкейк Нью-Йорк', price: 1690, emoji: '🍰', image: img('swttys1511385853.jpg'), description: 'Нежный сливочный чизкейк на песочной основе.' },

  { id: 'd11', restaurantId: 'tokyo-roll', category: 'asia', name: 'Суши сет', price: 4590, emoji: '🍣', image: img('g046bb1663960946.jpg'), description: 'Роллы с лососем, огурцом и сливочным сыром, 16 шт.' },
  { id: 'd12', restaurantId: 'tokyo-roll', category: 'asia', name: 'Рамен с яйцом', price: 2790, emoji: '🍜', image: img('ip5xtp1769779958.jpg'), description: 'Насыщенный бульон, пшеничная лапша, яйцо и зелёный лук.' },
  { id: 'd13', restaurantId: 'tokyo-roll', category: 'asia', name: 'Лапша с говядиной', price: 2990, emoji: '🍝', image: img('1529444830.jpg'), description: 'Лапша вок с говядиной, овощами и соусом терияки.' },
  { id: 'd14', restaurantId: 'tokyo-roll', category: 'asia', name: 'Тайский зелёный карри', price: 3190, emoji: '🍛', image: img('sstssx1487349585.jpg'), description: 'Курица в кокосовом карри с рисом жасмин.' },
  { id: 'd15', restaurantId: 'tokyo-roll', category: 'asia', name: 'Яичный суп', price: 1490, emoji: '🥣', image: img('1529446137.jpg'), description: 'Лёгкий китайский суп с яйцом и зелёным луком.' },

  { id: 'd16', restaurantId: 'dastarkhan', category: 'east', name: 'Плов с бараниной', price: 2890, emoji: '🍚', image: img('kos9av1699014767.jpg'), description: 'Рис, нежная баранина, морковь и специи, как дома.' },
  { id: 'd17', restaurantId: 'dastarkhan', category: 'east', name: 'Адана кебаб', price: 3290, emoji: '🍢', image: img('04axct1763793018.jpg'), description: 'Острый кебаб из рубленого мяса с лавашом и овощами.' },
  { id: 'd18', restaurantId: 'dastarkhan', category: 'east', name: 'Шаурма с говядиной', price: 1890, emoji: '🌯', image: img('kcv6hj1598733479.jpg'), description: 'Говядина, свежие овощи и чесночный соус в лаваше.' },
  { id: 'd19', restaurantId: 'dastarkhan', category: 'east', name: 'Шаурма с курицей', price: 1690, emoji: '🌯', image: img('hcg6l91763596970.jpg'), description: 'Курица с травами и йогуртовым соусом.' },
  { id: 'd20', restaurantId: 'dastarkhan', category: 'east', name: 'Салат Шопский', price: 1390, emoji: '🥗', image: img('bqx8mc1782684286.jpg'), description: 'Томаты, огурцы, перец, лук и брынза.' },

  { id: 'd21', restaurantId: 'sweet-day', category: 'desserts', name: 'Панкейки', price: 1490, emoji: '🥞', image: img('rwuyqx1511383174.jpg'), description: 'Пышные панкейки с кленовым сиропом и ягодами.' },
  { id: 'd22', restaurantId: 'sweet-day', category: 'desserts', name: 'Банановые панкейки', price: 1590, emoji: '🥞', image: img('sywswr1511383814.jpg'), description: 'Панкейки с бананом и мёдом.' },
  { id: 'd23', restaurantId: 'sweet-day', category: 'desserts', name: 'Морковный торт', price: 1390, emoji: '🍰', image: img('vrspxv1511722107.jpg'), description: 'Пряный морковный бисквит со сливочным кремом.' },
  { id: 'd24', restaurantId: 'sweet-day', category: 'desserts', name: 'Шоколадные брауни', price: 1290, emoji: '🍫', image: img('yypvst1511386427.jpg'), description: 'Влажные брауни с малиной.' },
  { id: 'd25', restaurantId: 'sweet-day', category: 'desserts', name: 'Яблочный пирог', price: 1190, emoji: '🥧', image: img('c0gmo31766594751.jpg'), description: 'Тёплый пирог с яблоками и корицей.' },

  { id: 'd26', restaurantId: 'burger-lab', category: 'drinks', name: 'Кола', price: 590, emoji: '🥤', image: null, description: 'Охлаждённая кола, 0,5 л.' },
  { id: 'd27', restaurantId: 'sweet-day', category: 'drinks', name: 'Лимонад манго-маракуйя', price: 1190, emoji: '🍹', image: null, description: 'Домашний лимонад из пюре манго и маракуйи, 0,5 л.' },
  { id: 'd28', restaurantId: 'sweet-day', category: 'drinks', name: 'Капучино', price: 990, emoji: '☕', image: null, description: 'Двойной эспрессо и молочная пена, 300 мл.' },
  { id: 'd29', restaurantId: 'dastarkhan', category: 'drinks', name: 'Айран', price: 490, emoji: '🥛', image: null, description: 'Освежающий кисломолочный напиток, 0,5 л.' },
];

const descriptions: Record<string, string> = {
  'burger-lab': 'Сочные бургеры из мраморной говядины, хрустящие крылья и картофель. Готовим на открытом гриле.',
  'roma-pizza': 'Итальянская пицца из дровяной печи, домашняя паста и десерты по рецептам из Рима.',
  'tokyo-roll': 'Японская и паназиатская кухня: роллы, рамен, вок и карри от шефа из Токио.',
  dastarkhan: 'Казахская и восточная кухня: плов в казане, кебабы на углях и шаурма.',
  'sweet-day': 'Кондитерская с домашними тортами, панкейками и свежим кофе.',
};

for (const r of restaurants) {
  r.description = descriptions[r.id];
  r.categories = [...new Set(dishes.filter((d) => d.restaurantId === r.id).map((d) => d.category))];
}

const ingredients: Record<string, [string, string][]> = {
  burgers: [['🥩', 'Мясо'], ['🧀', 'Сыр'], ['🍅', 'Томат'], ['🥬', 'Салат'], ['🧅', 'Лук']],
  pizza: [['🧀', 'Моцарелла'], ['🍅', 'Томаты'], ['🌿', 'Базилик'], ['🧄', 'Чеснок'], ['🍄', 'Грибы']],
  asia: [['🍚', 'Рис'], ['🐟', 'Рыба'], ['🥒', 'Огурец'], ['🌶️', 'Перец'], ['🥢', 'Соус']],
  east: [['🥩', 'Баранина'], ['🍚', 'Рис'], ['🥕', 'Морковь'], ['🧅', 'Лук'], ['🌶️', 'Специи']],
  desserts: [['🥚', 'Яйца'], ['🥛', 'Молоко'], ['🍫', 'Шоколад'], ['🍓', 'Ягоды'], ['🍯', 'Мёд']],
  drinks: [['🧊', 'Лёд'], ['🍋', 'Лимон'], ['🌿', 'Мята']],
};

const sizes: Record<string, Size[]> = {
  pizza: [
    { id: 'small', label: '25 см', extra: 0 },
    { id: 'medium', label: '30 см', extra: 700 },
    { id: 'large', label: '35 см', extra: 1400 },
  ],
  burgers: [
    { id: 'single', label: 'Обычный', extra: 0 },
    { id: 'double', label: 'Двойной', extra: 900 },
  ],
  drinks: [
    { id: 'small', label: '0,3 л', extra: 0 },
    { id: 'large', label: '0,5 л', extra: 300 },
  ],
};

for (const d of dishes) {
  d.ingredients = ingredients[d.category].map(([emoji, name]) => ({ emoji, name }));
  const sized = (d.category === 'pizza' && d.emoji === '🍕') || (d.category === 'burgers' && d.emoji === '🍔') || d.category === 'drinks';
  d.sizes = sized ? (sizes[d.category] ?? []) : [];
  d.popular = ['d1', 'd7', 'd11', 'd16', 'd18', 'd21', 'd3', 'd12'].includes(d.id);
}

export const couriers: Courier[] = [
  { name: 'Ерлан', phone: '+7 701 555 12 34', avatar: '🧑🏻' },
  { name: 'Айгерим', phone: '+7 702 555 43 21', avatar: '👩🏻' },
  { name: 'Данияр', phone: '+7 705 555 77 88', avatar: '👨🏻' },
];

export const courierReplies: string[] = [
  'Принял, уже еду к вам!',
  'Буду минут через 10.',
  'Подъезжаю, встречайте у подъезда.',
  'Хорошо, позвоню, когда буду у двери.',
  'Спасибо, приятного аппетита!',
];

export const faq: { q: string; a: string }[] = [
  { q: 'Сколько стоит доставка?', a: 'Зависит от ресторана: от 0 до 500 ₸. Стоимость видна на карточке ресторана и в корзине.' },
  { q: 'Как применить промокод?', a: 'Введите промокод в корзине перед оплатой. Например, FOODGO25 даёт скидку 25%.' },
  { q: 'Можно ли отменить заказ?', a: 'Да, пока ресторан не начал готовить. Откройте «Мои заказы» и нажмите «Отменить».' },
  { q: 'Как связаться с курьером?', a: 'На экране отслеживания заказа есть кнопки чата и звонка курьеру.' },
  { q: 'Какие способы оплаты есть?', a: 'Наличными курьеру или картой. Карту можно сохранить в профиле.' },
];

export const promos: Promo[] = [
  { code: 'FOODGO25', percent: 25, title: 'Скидка 25% на первый заказ' },
  { code: 'WELCOME10', percent: 10, title: 'Скидка 10% на любой заказ' },
];
