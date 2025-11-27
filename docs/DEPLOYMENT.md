# Развертывание на Ubuntu 20.04.5 LTS

## Требования

- Ubuntu 20.04.5 LTS
- Docker и Docker Compose
- Node.js 18+ (для локальной разработки)

**Примечание:** Проект использует JSON хранилище вместо SQL базы данных, поэтому не требуется настройка PostgreSQL.

## Установка Docker

```bash
# Обновление системы
sudo apt update
sudo apt upgrade -y

# Установка зависимостей
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Добавление официального GPG ключа Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавление репозитория Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установка Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Проверка установки
docker --version
docker compose version
```

## Развертывание приложения

```bash
# Клонирование репозитория
git clone <repository-url>
cd edatrat

# Копирование переменных окружения (если нужно)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Убедитесь, что директория данных существует
mkdir -p backend/data

# Запуск контейнеров
docker compose up -d

# Просмотр логов
docker compose logs -f

# Остановка
docker compose down

# Остановка с удалением данных
docker compose down -v
```

## Настройка Nginx (опционально, для production)

Если используете Nginx как reverse proxy:

```nginx
server {
    listen 80;
    server_name vgk-perv.ru;

    location / {
        proxy_pass http://localhost:27015;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Или можно напрямую использовать порт 27015 без Nginx.

## Обновление приложения

```bash
# Остановка контейнеров
docker compose down

# Обновление кода
git pull

# Пересборка и запуск
docker compose up -d --build
```

