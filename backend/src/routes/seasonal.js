const express = require('express');
const router = express.Router();
const storage = require('../services/storage');

// Получить сезонные продукты
router.get('/products', async (req, res) => {
  try {
    const region = req.query.region || 'moscow';
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    
    const seasonalData = await storage.find('seasonal_products', item => 
      item.region === region && item.month === month && item.is_seasonal
    );
    
    // Добавляем информацию о продуктах
    const products = await storage.getAll('products');
    const result = seasonalData.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        id: product?.id,
        name: product?.name || item.product_name,
        is_seasonal: item.is_seasonal,
        price_range: {
          min: item.price_range_min,
          max: item.price_range_max
        }
      };
    });
    
    res.json({ products: result });
  } catch (error) {
    console.error('Error getting seasonal products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Получить рецепты из сезонных продуктов
router.get('/recipes', async (req, res) => {
  try {
    const region = req.query.region || 'moscow';
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    
    // Получаем сезонные продукты
    const seasonalData = await storage.find('seasonal_products', item => 
      item.region === region && item.month === month && item.is_seasonal
    );
    
    const seasonalProductIds = seasonalData.map(item => item.product_id);
    
    // Получаем рецепты, которые используют сезонные продукты
    const recipes = await storage.getAll('recipes');
    const seasonalRecipes = recipes.filter(recipe => {
      if (!recipe.ingredients) return false;
      return recipe.ingredients.some(ing => 
        seasonalProductIds.includes(ing.product_id)
      );
    });
    
    res.json({ recipes: seasonalRecipes });
  } catch (error) {
    console.error('Error getting seasonal recipes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

