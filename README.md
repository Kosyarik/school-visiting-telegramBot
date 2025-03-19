# 📚 School Visiting Telegram Bot

Сучасний Telegram бот для автоматизації збору даних про відвідування учнів у школі! 🚀

## 🌟 Опис

**School Visiting Telegram Bot** — це зручний інструмент для вчителів та адміністраторів шкіл, який дозволяє швидко фіксувати дані про відсутніх учнів. Бот інтегрується з Google таблицями, забезпечуючи централізоване зберігання інформації. Все, що потрібно — кілька кліків у Telegram! 📱

### Основні можливості:

- 🏫 Вибір класу з меню (наприклад, 1А, 1Б, 2А тощо).
- 📋 Тип відсутності: "Цілий клас" або "Група".
- 🔢 Введення кількості учнів, які відсутні.
- 📊 Автоматичний запис у Google таблицю:
  - Якщо обрано "Цілий клас" — бот записує введене значення.
  - Якщо обрано "Група" — додає нове значення до вже існуючого.
- 📅 Дані записуються у відповідний рядок (клас) і колонку (дата).

## ⚙️ Вимоги

- **Node.js** (версія 18 або вище) 🟢
- **Telegram Bot Token** (отримується через @BotFather) 📩
- **Google Cloud проект** із увімкненим Google Sheets API 📈
- **Файл credentials.json** для доступу до Google Sheets API 🔑
- **Google таблиця** з відповідною структурою (дати в колонках, класи в рядках) 📊

## 🚀 Налаштування

### 1. Встановлення залежностей

```bash
npm install
```

### 2. Налаштування Telegram Bot

- Створіть бота через **@BotFather** у Telegram. 🤖
- Отримайте **токен** бота.
- Створіть файл `.env` у корені проєкту та додайте токен:

```text
BOT_TOKEN=your_bot_token_here
SPREADSHEET_ID=your_bot_token_here
TYPE=your_bot_token_here
PROJECT_ID=your_bot_token_here
PRIVATE_KEY_ID=your_bot_token_here
PRIVATE_KEY=your_bot_token_here
CLIENT_EMAIL=your_bot_token_here
CLIENT_ID=your_bot_token_here
```

### 3. Налаштування Google Sheets API

- Увімкніть **Google Sheets API** у Google Cloud Console. ☁️
- Створіть **сервісний акаунт** дані помістіть в .env.
- Надайте сервісному акаунту доступ до вашої Google таблиці.
- У файлі `services/googleSheets.js` замініть `YOUR_SPREADSHEET_ID` на ID вашої Google таблиці.

### 4. Налаштування класів

Список класів зберігається у файлі `config/classes.json`. Ви можете редагувати його, додаючи або видаляючи класи за потреби.

Приклад `classes.json`:

```json
{
  "classes": [
    "1А", "1Б", "2А", "2Б", "2В", "3А", "3Б", "4А", "4Б",
    "5А", "5Б", "6А", "6Б", "7А", "7Б", "8А", "8Б",
    "9А", "9Б", "10А", "10Б", "11А", "11Б"
  ]
}
```

## ▶️ Запуск бота

```bash
npm start
```

Бот запуститься і буде готовий до використання у Telegram! 🎉

## 📲 Використання

1. Знайдіть вашого бота у Telegram та запустіть його командою `/start`. 🚀
2. Бот запропонує обрати клас із меню (наприклад, **1А, 2Б** тощо).
3. Після вибору класу оберіть тип: **"Цілий клас"** або **"Група"**.
4. Введіть кількість відсутніх учнів.
5. Бот запише дані у Google таблицю та повідомить про успішне виконання.

### Приклад взаємодії:

```
Користувач: /start
Бот: "Виберіть клас: [1А] [1Б] [2А] ..."
Користувач обирає "1А".
Бот: "Оберіть: [Цілий клас] [Група]"
Користувач обирає "Група".
Бот: "Введіть кількість учнів:"
Користувач: "3"
Бот: "Дані успішно записані!" ✅
```

## ⚠️ Обмеження та примітки

- Бот працює з датами, які вказані у таблиці. Якщо поточна дата не відповідає жодній колонці, потрібно оновити логіку у `services/googleSheets.js`.
- Код розрахований на таблицю з 7 днями. Для роботи з іншими датами потрібно змінити метод `getColumnIndex`.
- Додайте додаткову валідацію та обробку помилок, якщо це необхідно для вашого випадку.

## 👨‍💻 Розробник

Цей бот створений для автоматизації збору даних про відвідування учнів у школі. Якщо у вас є питання, пропозиції або ідеї щодо покращення, звертайтесь до розробника! 📧

---

✨ Дякуємо, що використовуєте **School Visiting Telegram Bot**! ✨
