const express = require('express');
const router = express.Router();
const storage = require('../services/storage');

// Получить список рецептов
router.get('/', async (req, res) => {
  try {
    let recipes = await storage.getAll('recipes');
    
    // Фильтрация по тегам
    if (req.query.tags) {
      const tags = req.query.tags.split(',');
      recipes = recipes.filter(recipe => 
        tags.some(tag => recipe.tags?.includes(tag))
      );
    }
    
    // Фильтрация по времени приготовления
    if (req.query.cooking_time) {
      const maxTime = parseInt(req.query.cooking_time);
      recipes = recipes.filter(recipe => recipe.cooking_time <= maxTime);
    }
    
    // Фильтрация по сложности
    if (req.query.difficulty) {
      recipes = recipes.filter(recipe => recipe.difficulty === req.query.difficulty);
    }
    
    // Пагинация
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const paginatedRecipes = recipes.slice(offset, offset + limit);
    
    res.json({
      recipes: paginatedRecipes,
      total: recipes.length,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error getting recipes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить рецепт по ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await storage.getById('recipes', parseInt(req.params.id));
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error getting recipe:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить рецепты из имеющихся ингредиентов
router.get('/from-ingredients', async (req, res) => {
  try {
    const ingredientIds = req.query.ingredients?.split(',').map(id => parseInt(id)) || [];
    
    if (ingredientIds.length === 0) {
      return res.json({ recipes: [] });
    }
    
    const recipes = await storage.getAll('recipes');
    
    // Находим рецепты, которые можно приготовить из имеющихся ингредиентов
    const availableRecipes = recipes.filter(recipe => {
      if (!recipe.ingredients || recipe.ingredients.length === 0) return false;
      
      // Проверяем, есть ли все необходимые ингредиенты
      return recipe.ingredients.every(ing => 
        ingredientIds.includes(ing.product_id)
      );
    });
    
    res.json({ recipes: availableRecipes });
  } catch (error) {
    console.error('Error getting recipes from ingredients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

