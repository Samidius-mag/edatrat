-- Схема базы данных для ЕмПоСезону

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Профили пользователей
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    family_size INTEGER DEFAULT 1,
    children_ages INTEGER[],
    goals TEXT[], -- weight_loss, maintenance, muscle_gain, healthy
    allergies TEXT[],
    religious_restrictions TEXT[],
    dislikes TEXT[],
    cuisine_style VARCHAR(100),
    cooking_time VARCHAR(50), -- quick, medium, long
    budget_per_week DECIMAL(10, 2),
    region VARCHAR(100) DEFAULT 'moscow',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Категории продуктов
CREATE TABLE IF NOT EXISTS product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    parent_id INTEGER REFERENCES product_categories(id)
);

-- Продукты
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES product_categories(id),
    unit VARCHAR(50), -- кг, г, шт, л, мл
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Рецепты
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cooking_time INTEGER, -- в минутах
    difficulty VARCHAR(50), -- easy, medium, hard
    servings INTEGER DEFAULT 4,
    calories_per_serving INTEGER,
    steps TEXT[],
    tags TEXT[], -- vegetarian, quick, seasonal, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ингредиенты рецептов
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    amount DECIMAL(10, 2),
    unit VARCHAR(50),
    notes TEXT -- альтернативы, замечания
);

-- Сезонность продуктов
CREATE TABLE IF NOT EXISTS seasonal_products (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    region VARCHAR(100),
    month INTEGER, -- 1-12
    is_seasonal BOOLEAN DEFAULT true,
    price_range_min DECIMAL(10, 2),
    price_range_max DECIMAL(10, 2)
);

-- Холодильник (остатки продуктов)
CREATE TABLE IF NOT EXISTS pantry_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    amount DECIMAL(10, 2),
    unit VARCHAR(50),
    expiry_date DATE,
    added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Недельные меню
CREATE TABLE IF NOT EXISTS weekly_menus (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_start)
);

-- Блюда в меню
CREATE TABLE IF NOT EXISTS menu_meals (
    id SERIAL PRIMARY KEY,
    weekly_menu_id INTEGER REFERENCES weekly_menus(id) ON DELETE CASCADE,
    day_of_week INTEGER, -- 0-6 (понедельник-воскресенье)
    meal_type VARCHAR(50), -- breakfast, lunch, dinner, snack
    recipe_id INTEGER REFERENCES recipes(id),
    position INTEGER -- для сортировки
);

-- Списки покупок
CREATE TABLE IF NOT EXISTS shopping_lists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    weekly_menu_id INTEGER REFERENCES weekly_menus(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Элементы списка покупок
CREATE TABLE IF NOT EXISTS shopping_list_items (
    id SERIAL PRIMARY KEY,
    shopping_list_id INTEGER REFERENCES shopping_lists(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    amount DECIMAL(10, 2),
    unit VARCHAR(50),
    is_checked BOOLEAN DEFAULT false,
    estimated_price DECIMAL(10, 2),
    store_category VARCHAR(100) -- для группировки в магазине
);

-- Акции магазинов (кэш)
CREATE TABLE IF NOT EXISTS store_discounts (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(255),
    product_id INTEGER REFERENCES products(id),
    discount_percent DECIMAL(5, 2),
    original_price DECIMAL(10, 2),
    discounted_price DECIMAL(10, 2),
    valid_from DATE,
    valid_until DATE,
    store_location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX idx_pantry_items_expiry ON pantry_items(expiry_date);
CREATE INDEX idx_weekly_menus_user_id ON weekly_menus(user_id);
CREATE INDEX idx_menu_meals_menu_id ON menu_meals(weekly_menu_id);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_seasonal_products_region_month ON seasonal_products(region, month);
CREATE INDEX idx_store_discounts_product ON store_discounts(product_id);
CREATE INDEX idx_store_discounts_valid ON store_discounts(valid_from, valid_until);

