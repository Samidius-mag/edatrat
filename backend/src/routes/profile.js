const express = require('express');
const router = express.Router();
const storage = require('../services/storage');

// Получить профиль пользователя
router.get('/', async (req, res) => {
  try {
    // TODO: Получить user_id из JWT токена
    const userId = req.user?.id || 1; // Временная заглушка
    
    const profiles = await storage.getAll('user_profiles');
    const profile = profiles.find(p => p.user_id === userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
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
    const userId = req.user?.id || 1; // Временная заглушка
    
    const profiles = await storage.getAll('user_profiles');
    const profileIndex = profiles.findIndex(p => p.user_id === userId);
    
    if (profileIndex === -1) {
      return res.status(404).json({ error: 'Profile not found' });
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

