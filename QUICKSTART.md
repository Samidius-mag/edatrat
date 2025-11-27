# Быстрый старт

## Что было сделано

✅ Проанализировано ТЗ и создана структура проекта  
✅ Настроена архитектура (Backend + Frontend)  
✅ Создана схема базы данных PostgreSQL  
✅ Настроен Docker для развертывания  
✅ Создана документация (API, Roadmap, Deployment)

## Структура проекта

```
edatrat/
├── backend/          # Node.js API (Express)
├── frontend/         # React приложение (Vite)
├── database/         # SQL схемы
├── docker-compose.yml
└── docs/            # Документация
```

## Следующие шаги для разработки

### 1. Установка зависимостей

```bash
# Установить все зависимости
npm run install:all

# Или по отдельности
cd backend && npm install
cd frontend && npm install
```

### 2. Настройка переменных окружения

```bash
# Backend
cp backend/.env.example backend/.env
# Отредактируйте backend/.env

# Frontend (если нужно)
# Создайте frontend/.env с REACT_APP_API_URL=http://localhost:3001/api
```

### 3. Запуск разработки

```bash
# Запустить все сервисы через Docker
docker compose up

# Или локально (в разных терминалах):
npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:3000
```

## Что реализовано сейчас

- ✅ Базовая структура backend API
- ✅ JSON хранилище данных
- ✅ Маршруты для работы с данными (recipes, pantry, seasonal, profile)
- ✅ Базовая структура frontend
- ✅ Docker конфигурация
- ✅ Начальные данные (продукты, рецепты, сезонность)

## Что нужно реализовать дальше

### Приоритет 1 (MVP)
1. **Аутентификация** - регистрация и вход
2. **Профиль пользователя** - CRUD операции
3. **База рецептов** - заполнить минимум 50 рецептов
4. **Генератор меню** - алгоритм подбора блюд
5. **Список покупок** - генерация из меню
6. **Холодильник** - учет остатков

### Приоритет 2
1. Рекомендации рецептов из остатков
2. Базовый учет сезонности
3. UI для всех основных функций

## Полезные ссылки

- [Полный анализ ТЗ](docs/TZ_ANALYSIS.md)
- [API Документация](docs/API.md)
- [Roadmap разработки](docs/ROADMAP.md)
- [Инструкции по развертыванию](docs/DEPLOYMENT.md)

## Команды разработки

```bash
# Установка
npm run install:all

# Разработка
npm run dev              # Запустить все
npm run dev:backend      # Только backend
npm run dev:frontend     # Только frontend

# Сборка
npm run build

# Docker
docker compose up        # Запустить все сервисы
docker compose down      # Остановить
docker compose logs -f   # Логи
```

## Структура данных

Все данные хранятся в JSON файлах в `backend/data/`:
- `users.json` - пользователи
- `user_profiles.json` - профили пользователей
- `products.json` - продукты
- `recipes.json` - рецепты
- `seasonal_products.json` - сезонность
- `pantry_items.json` - остатки в холодильнике
- `weekly_menus.json` - недельные меню
- `shopping_lists.json` - списки покупок
- `store_discounts.json` - акции магазинов

## Поддержка

При возникновении проблем:
1. Проверьте, что все зависимости установлены
2. Убедитесь, что директория `backend/data/` существует
3. Проверьте переменные окружения в `.env`
4. Посмотрите логи: `docker compose logs`

