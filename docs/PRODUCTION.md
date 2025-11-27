# Настройка для production на vgk-perv.ru

## Конфигурация портов

- **Frontend:** `vgk-perv.ru:27015`
- **Backend API:** `vgk-perv.ru:3001` (или внутренний порт)

## Переменные окружения

### Backend (.env)

```env
NODE_ENV=production
PORT=3001
DATA_DIR=./data
CORS_ORIGIN=http://vgk-perv.ru:27015
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

### Frontend (.env)

```env
VITE_API_URL=http://vgk-perv.ru:3001
```

## Запуск через Docker

```bash
# Запуск всех сервисов
docker compose up -d

# Просмотр логов
docker compose logs -f frontend
docker compose logs -f backend
```

## Проверка работы

1. Frontend должен быть доступен: `http://vgk-perv.ru:27015`
2. Backend API: `http://vgk-perv.ru:3001/api/health`

## Настройка файрвола

Убедитесь, что порты открыты:

```bash
# Ubuntu/Debian
sudo ufw allow 27015/tcp
sudo ufw allow 3001/tcp
sudo ufw reload
```

## Nginx (опционально)

Если хотите использовать стандартные порты через Nginx:

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

