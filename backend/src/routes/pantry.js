const express = require('express');
const router = express.Router();
const storage = require('../services/storage');

// Получить список продуктов в холодильнике
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || 1; // Временная заглушка
    
    const items = await storage.find('pantry_items', item => item.user_id === userId);
    
    // Добавляем информацию о продуктах
    const products = await storage.getAll('products');
    const itemsWithProducts = items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        ...item,
        product_name: product?.name || 'Unknown',
        product_category: product?.category || 'Unknown'
      };
    });
    
    res.json({ items: itemsWithProducts });
  } catch (error) {
    console.error('Error getting pantry items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Добавить продукт в холодильник
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id || 1; // Временная заглушка
    
    const item = await storage.create('pantry_items', {
      user_id: userId,
      ...req.body
    });
    
    res.status(201).json(item);
  } catch (error) {
    console.error('Error adding pantry item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Обновить продукт в холодильнике
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || 1; // Временная заглушка
    const itemId = parseInt(req.params.id);
    
    const item = await storage.getById('pantry_items', itemId);
    
    if (!item || item.user_id !== userId) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    const updatedItem = await storage.update('pantry_items', itemId, req.body);
    res.json(updatedItem);
  } catch (error) {
    console.error('Error updating pantry item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Удалить продукт из холодильника
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user?.id || 1; // Временная заглушка
    const itemId = parseInt(req.params.id);
    
    const item = await storage.getById('pantry_items', itemId);
    
    if (!item || item.user_id !== userId) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    await storage.delete('pantry_items', itemId);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

