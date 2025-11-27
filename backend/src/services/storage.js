const JsonStorage = require('../utils/jsonStorage');
const path = require('path');

const dataDir = process.env.DATA_DIR || path.join(__dirname, '../../data');

// Создаем единый экземпляр хранилища
const storage = new JsonStorage(dataDir);

module.exports = storage;

