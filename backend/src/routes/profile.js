const express = require('express');
const router = express.Router();
const storage = require('../services/storage');
const { authenticateToken } = require('../middleware/auth');

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// Получить профиль пользователя
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profiles = await storage.getAll('user_profiles');
    const profile = profiles.find(p => p.user_id === userId);
    
    if (!profile) {
      // Создаем профиль по умолчанию, если его нет
      const newProfile = await storage.create('user_profiles', {
        user_id: userId,
        family_size: 1,
        children_ages: [],
        goals: [],
        allergies: [],
        religious_restrictions: [],
        dislikes: [],
        cuisine_style: 'russian',
        cooking_time: 'medium',
        budget_per_week: 3000,
        region: 'moscow',
      });
      return res.json(newProfile);
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить профиль пользователя
router.put('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profiles = await storage.getAll('user_profiles');
    const profileIndex = profiles.findIndex(p => p.user_id === userId);
    
    if (profileIndex === -1) {
      // Создаем профиль, если его нет
      const newProfile = await storage.create('user_profiles', {
        user_id: userId,
        ...req.body,
      });
      return res.json(newProfile);
    }
    
    const updatedProfile = {
      ...profiles[profileIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    profiles[profileIndex] = updatedProfile;
    await storage.write('user_profiles', profiles);
    
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

