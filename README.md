# FoodGo — доставка еды

Мобильное приложение на Expo (React Native, TypeScript) и собственный API-сервер на Node.js + Express.

## Запуск

```bash
npm install
npm run server:install
```

В первом терминале — сервер (порт 4100):

```bash
npm run server
```

Во втором — приложение:

```bash
npx expo start
```

- Телефон: приложение **Expo Go**, отсканировать QR-код. Телефон и компьютер — в одной Wi-Fi сети.
- Браузер: нажать `w` в терминале Expo.

Приложение само находит сервер по IP компьютера. Если Windows спросит про доступ Node.js к сети — разрешить для частных сетей, иначе телефон не достучится до сервера. Адрес можно задать вручную в `.env`: `EXPO_PUBLIC_API_URL=http://192.168.1.10:4100/api`.

## Тестовые данные

| Что | Значение |
|---|---|
| Кабинет ресторана | `chef@burger-lab.kz`, `chef@roma-pizza.kz`, `chef@tokyo-roll.kz`, `chef@dastarkhan.kz`, `chef@sweet-day.kz` — пароль `chef123` |
| Промокоды | `FOODGO25` (−25%), `WELCOME10` (−10%) |
| Тестовая карта | `4242 4242 4242 4242`, любой будущий срок, любой CVC |

Клиентский аккаунт создаётся через регистрацию. Оплата демонстрационная: сервер проверяет номер карты по алгоритму Луна и хранит только последние 4 цифры. Код восстановления пароля показывается на экране и в консоли сервера, почтовый сервис не подключён.

Очистить базу (пользователи, заказы): `npm run server:reset`.

## Проверки

```bash
npm run lint
npm run typecheck
```

## Структура

```
src/app/          экраны (Expo Router: файл = экран)
  (auth)/         вход, регистрация, восстановление пароля
  chef/           кабинет ресторана
src/components/   общие компоненты
src/constants/    тема, контексты авторизации и корзины
src/api/          клиент API и типы
src/hooks/        useApi, useAddToCart
src/utils/        диалоги, адреса
server/           API: index.ts — маршруты, seed.ts — рестораны и меню, data/db.json — база
```

## Как идёт заказ

1. Клиент оформляет заказ — статус «Заказ принят».
2. Ресторан в кабинете нажимает «Принять» → «Готовится», затем «Готово» → «Курьер в пути».
3. Через 3 минуты в пути заказ становится «Доставлен», клиент может его оценить.

Если ресторан не реагирует, статусы меняются сами: через 1 минуту «Готовится», ещё через 2 — «Курьер в пути».

## API

| Метод | Путь | |
|---|---|---|
| POST | `/api/auth/register`, `/login`, `/logout`, `/forgot`, `/verify`, `/reset` | авторизация |
| GET, PATCH | `/api/auth/me` | профиль |
| GET | `/api/categories`, `/api/restaurants`, `/api/restaurants/:id`, `/api/dishes`, `/api/dishes/:id` | меню |
| GET | `/api/promos/:code`, `/api/faq` | |
| GET, POST, DELETE | `/api/favorites`, `/api/addresses`, `/api/cards` | данные клиента |
| GET, POST | `/api/orders`, `/api/orders/:id`, `/cancel`, `/review`, `/messages` | заказы и чат с курьером |
| GET | `/api/notifications` | |
| GET, POST, DELETE | `/api/chef/dashboard`, `/orders`, `/orders/:id/status`, `/dishes`, `/reviews`, `/withdraw`, `/withdrawals` | кабинет ресторана |
