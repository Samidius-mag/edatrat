# API Документация

## Базовый URL
```
http://localhost:3001/api
```

## Аутентификация

Большинство endpoints требуют JWT токен в заголовке:
```
Authorization: Bearer <token>
```

## Endpoints

### Аутентификация

#### POST /auth/register
Регистрация нового пользователя

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### POST /auth/login
Вход пользователя

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### Профиль пользователя

#### GET /profile
Получить профиль текущего пользователя

**Response:**
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
  "region": "moscow"
}
```

#### PUT /profile
Обновить профиль

**Request Body:**
```json
{
  "family_size": 3,
  "goals": ["healthy"],
  "budget_per_week": 4000.00
}
```

### Рецепты

#### GET /recipes
Получить список рецептов

**Query Parameters:**
- `tags` - фильтр по тегам (через запятую)
- `cooking_time` - максимальное время приготовления
- `difficulty` - уровень сложности
- `limit` - количество результатов
- `offset` - смещение

**Response:**
```json
{
  "recipes": [
    {
      "id": 1,
      "name": "Омлет с овощами",
      "description": "Простой и полезный завтрак",
      "cooking_time": 15,
      "difficulty": "easy",
      "servings": 2,
      "calories_per_serving": 250,
      "tags": ["quick", "breakfast"]
    }
  ],
  "total": 50
}
```

#### GET /recipes/:id
Получить детали рецепта

**Response:**
```json
{
  "id": 1,
  "name": "Омлет с овощами",
  "description": "Простой и полезный завтрак",
  "cooking_time": 15,
  "difficulty": "easy",
  "servings": 2,
  "calories_per_serving": 250,
  "steps": ["Нарезать овощи", "Взбить яйца"],
  "ingredients": [
    {
      "product_id": 13,
      "product_name": "Яйца",
      "amount": 4,
      "unit": "шт"
    }
  ],
  "tags": ["quick", "breakfast"]
}
```

#### GET /recipes/from-ingredients
Получить рецепты из имеющихся ингредиентов

**Query Parameters:**
- `ingredients` - список ID продуктов (через запятую)

### Меню

#### POST /menu/generate
Сгенерировать недельное меню

**Request Body:**
```json
{
  "week_start": "2024-01-01",
  "use_pantry": true,
  "consider_discounts": false
}
```

**Response:**
```json
{
  "id": 1,
  "week_start": "2024-01-01",
  "days": [
    {
      "day_of_week": 1,
      "date": "2024-01-01",
      "meals": {
        "breakfast": { "recipe_id": 1, "recipe_name": "Омлет" },
        "lunch": { "recipe_id": 2, "recipe_name": "Курица с рисом" },
        "dinner": { "recipe_id": 3, "recipe_name": "Салат" }
      }
    }
  ]
}
```

#### GET /menu/week
Получить текущее недельное меню

**Query Parameters:**
- `week_start` - дата начала недели (YYYY-MM-DD)

#### PUT /menu/week/:day
Обновить меню на день

**Request Body:**
```json
{
  "breakfast": { "recipe_id": 5 },
  "lunch": { "recipe_id": 6 },
  "dinner": { "recipe_id": 7 }
}
```

#### DELETE /menu/week/:day/:meal
Удалить блюдо из меню

### Холодильник

#### GET /pantry
Получить список продуктов в холодильнике

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "product_id": 10,
      "product_name": "Молоко",
      "amount": 1,
      "unit": "л",
      "expiry_date": "2024-01-15",
      "added_date": "2024-01-08"
    }
  ]
}
```

#### POST /pantry
Добавить продукт в холодильник

**Request Body:**
```json
{
  "product_id": 10,
  "amount": 1,
  "unit": "л",
  "expiry_date": "2024-01-15"
}
```

#### PUT /pantry/:id
Обновить продукт

#### DELETE /pantry/:id
Удалить продукт

### Список покупок

#### GET /shopping-list
Получить список покупок для текущего меню

**Query Parameters:**
- `weekly_menu_id` - ID недельного меню

**Response:**
```json
{
  "id": 1,
  "items": [
    {
      "id": 1,
      "product_id": 8,
      "product_name": "Куриная грудка",
      "amount": 0.5,
      "unit": "кг",
      "is_checked": false,
      "estimated_price": 250.00,
      "store_category": "Мясо"
    }
  ],
  "total_estimated_price": 2450.00,
  "grouped_by_category": {
    "Мясо": [...],
    "Овощи": [...]
  }
}
```

#### POST /shopping-list/check-item
Отметить элемент как купленный

**Request Body:**
```json
{
  "item_id": 1,
  "is_checked": true
}
```

### Сезонность

#### GET /seasonal/products
Получить сезонные продукты

**Query Parameters:**
- `region` - регион (по умолчанию из профиля)
- `month` - месяц (1-12, по умолчанию текущий)

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Картофель",
      "is_seasonal": true,
      "price_range": {
        "min": 25.00,
        "max": 35.00
      }
    }
  ]
}
```

#### GET /seasonal/recipes
Получить рецепты из сезонных продуктов

## Коды ошибок

- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Не найдено
- `500` - Внутренняя ошибка сервера

