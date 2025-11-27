const express = require('express');
const router = express.Router();

// TODO: Реализовать аутентификацию
router.post('/register', async (req, res) => {
  res.json({ message: 'Registration endpoint - to be implemented' });
});

router.post('/login', async (req, res) => {
  res.json({ message: 'Login endpoint - to be implemented' });
});

module.exports = router;

