const storage = require('./storage');

class MenuGenerator {
  async generateWeeklyMenu(userId, weekStart, options = {}) {
    const { usePantry = true, considerSeasonal = true } = options;
    
    // Получаем профиль пользователя
    const profiles = await storage.getAll('user_profiles');
    const profile = profiles.find(p => p.user_id === userId);
    
    if (!profile) {
      throw new Error('User profile not found');
    }

    // Получаем рецепты
    let recipes = await storage.getAll('recipes');
    
    // Фильтрация по предпочтениям
    recipes = this.filterRecipesByProfile(recipes, profile);
    
    // Получаем остатки в холодильнике
    let pantryItems = [];
    if (usePantry) {
      pantryItems = await storage.find('pantry_items', item => item.user_id === userId);
    }
    
    // Генерируем меню на неделю
    const weekStartDate = new Date(weekStart);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStartDate);
      currentDate.setDate(weekStartDate.getDate() + i);
      
      const dayMenu = {
        day_of_week: i,
        date: currentDate.toISOString().split('T')[0],
        meals: {
          breakfast: this.selectRecipe(recipes, 'breakfast', profile, pantryItems),
          lunch: this.selectRecipe(recipes, 'lunch', profile, pantryItems),
          dinner: this.selectRecipe(recipes, 'dinner', profile, pantryItems),
          snacks: []
        }
      };
      
      days.push(dayMenu);
    }
    
    // Сохраняем меню
    const weeklyMenu = await storage.create('weekly_menus', {
      user_id: userId,
      week_start: weekStart,
      days: days,
    });
    
    return weeklyMenu;
  }
  
  filterRecipesByProfile(recipes, profile) {
    return recipes.filter(recipe => {
      // Фильтр по аллергиям
      if (profile.allergies && profile.allergies.length > 0) {
        // Упрощенная проверка - в реальности нужно проверять ингредиенты
        // Пока пропускаем все рецепты
      }
      
      // Фильтр по времени приготовления
      if (profile.cooking_time === 'quick' && recipe.cooking_time > 15) {
        return false;
      }
      if (profile.cooking_time === 'medium' && recipe.cooking_time > 30) {
        return false;
      }
      
      // Фильтр по целям (упрощенный)
      if (profile.goals && profile.goals.includes('weight_loss')) {
        if (recipe.calories_per_serving > 400) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  selectRecipe(recipes, mealType, profile, pantryItems) {
    // Фильтруем рецепты по типу приема пищи
    let suitableRecipes = recipes.filter(recipe => {
      if (mealType === 'breakfast') {
        return recipe.tags && recipe.tags.includes('breakfast');
      }
      if (mealType === 'lunch' || mealType === 'dinner') {
        return recipe.tags && (recipe.tags.includes('dinner') || recipe.tags.includes('lunch'));
      }
      return true;
    });
    
    // Если нет подходящих, берем любые
    if (suitableRecipes.length === 0) {
      suitableRecipes = recipes;
    }
    
    // Приоритет рецептам, которые можно приготовить из остатков
    if (pantryItems.length > 0) {
      const pantryProductIds = pantryItems.map(item => item.product_id);
      const recipesWithPantry = suitableRecipes.filter(recipe => {
        if (!recipe.ingredients) return false;
        return recipe.ingredients.some(ing => pantryProductIds.includes(ing.product_id));
      });
      
      if (recipesWithPantry.length > 0) {
        suitableRecipes = recipesWithPantry;
      }
    }
    
    // Выбираем случайный рецепт
    const randomIndex = Math.floor(Math.random() * suitableRecipes.length);
    const selectedRecipe = suitableRecipes[randomIndex];
    
    return selectedRecipe ? {
      recipe_id: selectedRecipe.id,
      recipe_name: selectedRecipe.name,
      cooking_time: selectedRecipe.cooking_time,
      servings: selectedRecipe.servings,
    } : null;
  }
  
  async getWeeklyMenu(userId, weekStart) {
    const menus = await storage.getAll('weekly_menus');
    return menus.find(m => 
      m.user_id === userId && 
      m.week_start === weekStart
    );
  }
  
  async updateDayMenu(userId, weekStart, dayOfWeek, mealType, recipeId) {
    const menu = await this.getWeeklyMenu(userId, weekStart);
    if (!menu) {
      throw new Error('Menu not found');
    }
    
    const recipes = await storage.getAll('recipes');
    const recipe = recipes.find(r => r.id === recipeId);
    
    if (!recipe) {
      throw new Error('Recipe not found');
    }
    
    if (menu.days[dayOfWeek]) {
      if (mealType === 'snacks') {
        if (!menu.days[dayOfWeek].meals.snacks) {
          menu.days[dayOfWeek].meals.snacks = [];
        }
        menu.days[dayOfWeek].meals.snacks.push({
          recipe_id: recipe.id,
          recipe_name: recipe.name,
        });
      } else {
        menu.days[dayOfWeek].meals[mealType] = {
          recipe_id: recipe.id,
          recipe_name: recipe.name,
          cooking_time: recipe.cooking_time,
          servings: recipe.servings,
        };
      }
      
      menu.updated_at = new Date().toISOString();
      await storage.update('weekly_menus', menu.id, menu);
    }
    
    return menu;
  }
}

module.exports = new MenuGenerator();

