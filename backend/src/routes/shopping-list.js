const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const shoppingListGenerator = require('../services/shoppingListGenerator');

router.use(authenticateToken);

// Получить список покупок
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const weeklyMenuId = parseInt(req.query.weekly_menu_id);
    
    if (!weeklyMenuId) {
      return res.status(400).json({ error: 'weekly_menu_id query parameter is required' });
    }
    
    let list = await shoppingListGenerator.getShoppingList(userId, weeklyMenuId);
    
    // Если списка нет, генерируем его
    if (!list) {
      list = await shoppingListGenerator.generateShoppingList(userId, weeklyMenuId);
    }
    
    res.json(list);
  } catch (error) {
    console.error('Error getting shopping list:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Отметить элемент списка
router.post('/check-item', async (req, res) => {
  try {
    const userId = req.user.id;
    const { shopping_list_id, item_index, is_checked } = req.body;
    
    if (shopping_list_id === undefined || item_index === undefined || is_checked === undefined) {
      return res.status(400).json({ error: 'shopping_list_id, item_index, and is_checked are required' });
    }
    
    const list = await shoppingListGenerator.checkItem(userId, shopping_list_id, item_index, is_checked);
    
    res.json(list);
  } catch (error) {
    console.error('Error checking item:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

module.exports = router;
