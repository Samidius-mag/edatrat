const express = require('express');
const router = express.Router();

// TODO: Реализовать работу с меню
router.post('/generate', async (req, res) => {
  res.json({ message: 'Generate menu endpoint - to be implemented' });
});

router.get('/week', async (req, res) => {
  res.json({ message: 'Get weekly menu endpoint - to be implemented' });
});

router.put('/week/:day', async (req, res) => {
  res.json({ message: 'Update day menu endpoint - to be implemented' });
});

router.delete('/week/:day/:meal', async (req, res) => {
  res.json({ message: 'Delete meal endpoint - to be implemented' });
});

module.exports = router;

