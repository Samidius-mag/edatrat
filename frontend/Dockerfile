FROM node:18-alpine

WORKDIR /app

# Копирование package файлов
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Открытие порта
EXPOSE 27015

# Запуск dev сервера
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "27015"]

