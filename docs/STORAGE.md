# JSON Хранилище данных

## Обзор

Вместо SQL базы данных используется файловое JSON хранилище. Это упрощает разработку MVP и не требует настройки базы данных.

## Структура

Все данные хранятся в директории `backend/data/` в виде JSON файлов:

- `users.json` - массив пользователей
- `user_profiles.json` - массив профилей пользователей
- `products.json` - массив продуктов
- `recipes.json` - массив рецептов
- `seasonal_products.json` - массив данных о сезонности
- `pantry_items.json` - массив остатков в холодильнике
- `weekly_menus.json` - массив недельных меню
- `shopping_lists.json` - массив списков покупок
- `store_discounts.json` - массив акций магазинов

## Класс JsonStorage

Класс `JsonStorage` предоставляет простой API для работы с JSON файлами:

```javascript
const storage = require('./services/storage');

// Чтение всех записей
const recipes = await storage.getAll('recipes');

// Получение по ID
const recipe = await storage.getById('recipes', 1);

// Создание
const newRecipe = await storage.create('recipes', {
  name: 'Новый рецепт',
  cooking_time: 20
});

// Обновление
const updated = await storage.update('recipes', 1, {
  cooking_time: 25
});

// Удаление
await storage.delete('recipes', 1);

// Поиск
const quickRecipes = await storage.find('recipes', r => r.cooking_time <= 15);
```

## Формат данных

### Пользователь
```json
{
  "id": 1,
  "email": "user@example.com",
  "password_hash": "...",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Профиль пользователя
```json
{
  "id": 1,
  "user_id": 1,
  "family_size": 2,
  "children_ages": [5, 8],
  "goals": ["healthy", "weight_loss"],
  "allergies": ["nuts"],
  "dislikes": ["onion"],
  "cuisine_style": "russian",
  "cooking_time": "quick",
  "budget_per_week": 3000.00,
  "region": "moscow",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### Рецепт
```json
{
  "id": 1,
  "name": "Омлет с овощами",
  "description": "Простой и полезный завтрак",
  "cooking_time": 15,
  "difficulty": "easy",
  "servings": 2,
  "calories_per_serving": 250,
  "steps": ["Шаг 1", "Шаг 2"],
  "ingredients": [
    {
      "product_id": 13,
      "product_name": "Яйца",
      "amount": 4,
      "unit": "шт"
    }
  ],
  "tags": ["quick", "breakfast"],
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

## Преимущества для MVP

1. **Простота** - не нужна настройка базы данных
2. **Быстрый старт** - можно сразу начать разработку
3. **Легкая отладка** - данные видны в текстовом виде
4. **Портативность** - легко копировать и бэкапить

## Ограничения

1. **Производительность** - не подходит для больших объемов данных
2. **Конкурентный доступ** - проблемы при одновременной записи
3. **Нет транзакций** - нельзя откатить изменения

Для MVP эти ограничения приемлемы. В будущем можно легко мигрировать на PostgreSQL или MongoDB.

## Миграция на SQL

Когда проект вырастет, можно:
1. Создать схему БД на основе JSON структур
2. Написать скрипт миграции данных из JSON в БД
3. Заменить `JsonStorage` на реальный ORM (например, Sequelize)

