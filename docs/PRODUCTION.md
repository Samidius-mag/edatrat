# Настройка для production на vgk-perv.ru

## Конфигурация портов

- **Frontend:** `https://vgk-perv.ru` (через Nginx на порту 443)
- **Backend API:** `https://vgk-perv.ru/api` (через Nginx на порту 443)
- **Локальные порты:**
  - Frontend: `localhost:27015`
  - Backend: `localhost:3001`

## Переменные окружения

### Backend (.env)

```env
NODE_ENV=production
PORT=3001
DATA_DIR=./data
CORS_ORIGIN=https://vgk-perv.ru
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

### Frontend (.env)

```env
VITE_API_URL=https://vgk-perv.ru/api
```

**Важно:** После настройки HTTPS используйте `https://` вместо `http://` в переменных окружения.

## Запуск через Docker

```bash
# Запуск всех сервисов
docker compose up -d

# Просмотр логов
docker compose logs -f frontend
docker compose logs -f backend
```

## Проверка работы

1. Frontend должен быть доступен: `https://vgk-perv.ru`
2. Backend API: `https://vgk-perv.ru/api/health`
3. HTTP автоматически редиректится на HTTPS

## Настройка файрвола

Убедитесь, что порты открыты:

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp    # HTTP (для редиректа на HTTPS)
sudo ufw allow 443/tcp   # HTTPS
sudo ufw reload
```

**Примечание:** Порты 27015 и 3001 должны быть доступны только локально (через Nginx).

## Настройка HTTPS

Подробная инструкция по настройке HTTPS с Let's Encrypt: [HTTPS_SETUP.md](HTTPS_SETUP.md)

## Nginx конфигурация

**Важно:** Для работы через HTTPS обязательно используйте Nginx как reverse proxy.

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

