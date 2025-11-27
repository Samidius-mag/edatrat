FROM node:18-alpine

WORKDIR /app

# Копирование package файлов
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Открытие порта
EXPOSE 3001

# Запуск приложения
CMD ["npm", "run", "dev"]

