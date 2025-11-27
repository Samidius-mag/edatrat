const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const menuGenerator = require('../services/menuGenerator');
const storage = require('../services/storage');

router.use(authenticateToken);

// Генерация недельного меню
router.post('/generate', async (req, res) => {
  try {
    const userId = req.user.id;
    const { week_start, use_pantry = true, consider_seasonal = true } = req.body;
    
    if (!week_start) {
      return res.status(400).json({ error: 'week_start is required' });
    }
    
    const menu = await menuGenerator.generateWeeklyMenu(userId, week_start, {
      usePantry: use_pantry,
      considerSeasonal: consider_seasonal,
    });
    
    res.json(menu);
  } catch (error) {
    console.error('Error generating menu:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Получить недельное меню
router.get('/week', async (req, res) => {
  try {
    const userId = req.user.id;
    const weekStart = req.query.week_start;
    
    if (!weekStart) {
      return res.status(400).json({ error: 'week_start query parameter is required' });
    }
    
    const menu = await menuGenerator.getWeeklyMenu(userId, weekStart);
    
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    
    res.json(menu);
  } catch (error) {
    console.error('Error getting menu:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить меню на день
router.put('/week/:day', async (req, res) => {
  try {
    const userId = req.user.id;
    const dayOfWeek = parseInt(req.params.day);
    const { week_start, meal_type, recipe_id } = req.body;
    
    if (!week_start || !meal_type || !recipe_id) {
      return res.status(400).json({ error: 'week_start, meal_type, and recipe_id are required' });
    }
    
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: 'day must be between 0 and 6' });
    }
    
    const menu = await menuGenerator.updateDayMenu(userId, week_start, dayOfWeek, meal_type, recipe_id);
    
    res.json(menu);
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Удалить блюдо из меню
router.delete('/week/:day/:meal', async (req, res) => {
  try {
    const userId = req.user.id;
    const dayOfWeek = parseInt(req.params.day);
    const mealType = req.params.meal;
    const weekStart = req.query.week_start;
    
    if (!weekStart) {
      return res.status(400).json({ error: 'week_start query parameter is required' });
    }
    
    const menu = await menuGenerator.getWeeklyMenu(userId, weekStart);
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    
    if (menu.days[dayOfWeek] && menu.days[dayOfWeek].meals[mealType]) {
      menu.days[dayOfWeek].meals[mealType] = null;
      menu.updated_at = new Date().toISOString();
      await storage.update('weekly_menus', menu.id, menu);
    }
    
    res.json(menu);
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
