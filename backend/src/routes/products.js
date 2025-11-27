const express = require('express');
const router = express.Router();
const storage = require('../services/storage');

// Получить список продуктов
router.get('/', async (req, res) => {
  try {
    const products = await storage.getAll('products');
    res.json({ products });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

