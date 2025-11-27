const express = require('express');
const router = express.Router();

// TODO: Реализовать работу со списком покупок
router.get('/', async (req, res) => {
  res.json({ message: 'Get shopping list endpoint - to be implemented' });
});

router.post('/check-item', async (req, res) => {
  res.json({ message: 'Check shopping list item endpoint - to be implemented' });
});

module.exports = router;

