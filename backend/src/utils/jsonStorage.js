const fs = require('fs').promises;
const path = require('path');

class JsonStorage {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.ensureDataDir();
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  getFilePath(collection) {
    return path.join(this.dataDir, `${collection}.json`);
  }

  async read(collection) {
    try {
      const filePath = this.getFilePath(collection);
      const data = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(data);
      // Убеждаемся, что всегда возвращаем массив
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Файл не существует, возвращаем пустой массив
        return [];
      }
      throw error;
    }
  }

  async write(collection, data) {
    const filePath = this.getFilePath(collection);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async getAll(collection) {
    const data = await this.read(collection);
    return Array.isArray(data) ? data : [];
  }

  async getById(collection, id) {
    const data = await this.read(collection);
    const arrayData = Array.isArray(data) ? data : [];
    return arrayData.find(item => item.id === id) || null;
  }

  async create(collection, item) {
    const data = await this.read(collection);
    
    // Убеждаемся, что data - массив
    const arrayData = Array.isArray(data) ? data : [];
    
    // Генерируем ID если его нет
    if (!item.id) {
      const maxId = arrayData.length > 0
        ? Math.max(...arrayData.map(i => i.id || 0))
        : 0;
      item.id = maxId + 1;
    }

    // Добавляем временные метки
    const now = new Date().toISOString();
    if (!item.created_at) item.created_at = now;
    item.updated_at = now;

    arrayData.push(item);
    await this.write(collection, arrayData);
    return item;
  }

  async update(collection, id, updates) {
    const data = await this.read(collection);
    const arrayData = Array.isArray(data) ? data : [];
    
    const index = arrayData.findIndex(i => i.id === id);
    if (index === -1) return null;
    
    const item = { 
      ...arrayData[index], 
      ...updates, 
      updated_at: new Date().toISOString() 
    };
    arrayData[index] = item;
    
    await this.write(collection, arrayData);
    return item;
  }

  async delete(collection, id) {
    const data = await this.read(collection);
    const arrayData = Array.isArray(data) ? data : [];
    
    const index = arrayData.findIndex(i => i.id === id);
    if (index === -1) return false;
    
    arrayData.splice(index, 1);
    await this.write(collection, arrayData);
    return true;
  }

  async find(collection, predicate) {
    const data = await this.read(collection);
    const arrayData = Array.isArray(data) ? data : [];
    return arrayData.filter(predicate);
  }

  async findOne(collection, predicate) {
    const data = await this.read(collection);
    const arrayData = Array.isArray(data) ? data : [];
    return arrayData.find(predicate) || null;
  }
}

module.exports = JsonStorage;

