const storage = require('./storage');

class ShoppingListGenerator {
  async generateShoppingList(userId, weeklyMenuId) {
    const menus = await storage.getAll('weekly_menus');
    const menu = menus.find(m => m.id === weeklyMenuId && m.user_id === userId);
    
    if (!menu) {
      throw new Error('Menu not found');
    }
    
    // Получаем остатки в холодильнике
    const pantryItems = await storage.find('pantry_items', item => item.user_id === userId);
    const pantryProductIds = pantryItems.map(item => item.product_id);
    
    // Получаем все рецепты
    const recipes = await storage.getAll('recipes');
    const products = await storage.getAll('products');
    
    // Собираем все ингредиенты из меню
    const ingredientMap = new Map();
    
    menu.days.forEach(day => {
      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const meal = day.meals[mealType];
        if (meal && meal.recipe_id) {
          const recipe = recipes.find(r => r.id === meal.recipe_id);
          if (recipe && recipe.ingredients) {
            recipe.ingredients.forEach(ing => {
              const key = `${ing.product_id}_${ing.unit}`;
              if (ingredientMap.has(key)) {
                const existing = ingredientMap.get(key);
                existing.amount += ing.amount;
              } else {
                const product = products.find(p => p.id === ing.product_id);
                ingredientMap.set(key, {
                  product_id: ing.product_id,
                  product_name: product ? product.name : ing.product_name,
                  amount: ing.amount,
                  unit: ing.unit,
                  category: product ? product.category : 'Другое',
                });
              }
            });
          }
        }
      });
      
      // Обрабатываем перекусы
      if (day.meals.snacks && Array.isArray(day.meals.snacks)) {
        day.meals.snacks.forEach(snack => {
          if (snack.recipe_id) {
            const recipe = recipes.find(r => r.id === snack.recipe_id);
            if (recipe && recipe.ingredients) {
              recipe.ingredients.forEach(ing => {
                const key = `${ing.product_id}_${ing.unit}`;
                if (ingredientMap.has(key)) {
                  const existing = ingredientMap.get(key);
                  existing.amount += ing.amount * 0.5; // Перекусы считаем как половину порции
                } else {
                  const product = products.find(p => p.id === ing.product_id);
                  ingredientMap.set(key, {
                    product_id: ing.product_id,
                    product_name: product ? product.name : ing.product_name,
                    amount: ing.amount * 0.5,
                    unit: ing.unit,
                    category: product ? product.category : 'Другое',
                  });
                }
              });
            }
          }
        });
      }
    });
    
    // Вычитаем то, что уже есть в холодильнике
    const shoppingItems = [];
    ingredientMap.forEach((item, key) => {
      const pantryItem = pantryItems.find(p => p.product_id === item.product_id);
      if (pantryItem) {
        // Уменьшаем количество на то, что есть
        const remaining = item.amount - (pantryItem.amount || 0);
        if (remaining > 0) {
          shoppingItems.push({
            ...item,
            amount: remaining,
          });
        }
      } else {
        shoppingItems.push(item);
      }
    });
    
    // Группируем по категориям
    const groupedByCategory = {};
    shoppingItems.forEach(item => {
      const category = item.category || 'Другое';
      if (!groupedByCategory[category]) {
        groupedByCategory[category] = [];
      }
      groupedByCategory[category].push({
        ...item,
        is_checked: false,
        estimated_price: 0, // Можно добавить расчет цены
      });
    });
    
    // Сохраняем список покупок
    const shoppingList = await storage.create('shopping_lists', {
      user_id: userId,
      weekly_menu_id: weeklyMenuId,
      items: shoppingItems,
      grouped_by_category: groupedByCategory,
      created_at: new Date().toISOString(),
    });
    
    return shoppingList;
  }
  
  async getShoppingList(userId, weeklyMenuId) {
    const lists = await storage.getAll('shopping_lists');
    return lists.find(l => 
      l.user_id === userId && 
      l.weekly_menu_id === weeklyMenuId
    );
  }
  
  async checkItem(userId, shoppingListId, itemIndex, isChecked) {
    const lists = await storage.getAll('shopping_lists');
    const list = lists.find(l => l.id === shoppingListId && l.user_id === userId);
    
    if (!list) {
      throw new Error('Shopping list not found');
    }
    
    if (list.items[itemIndex]) {
      list.items[itemIndex].is_checked = isChecked;
      list.updated_at = new Date().toISOString();
      await storage.update('shopping_lists', list.id, list);
    }
    
    return list;
  }
}

module.exports = new ShoppingListGenerator();

