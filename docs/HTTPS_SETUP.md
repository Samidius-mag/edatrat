# Настройка HTTPS для vgk-perv.ru

## Предварительные требования

- ✅ Certbot установлен
- ✅ Порт 443 открыт
- ✅ Домен vgk-perv.ru указывает на сервер
- ✅ Nginx установлен

## Шаг 1: Установка Nginx (если еще не установлен)

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## Шаг 2: Получение SSL сертификата

### Вариант A: Автоматический (через скрипт)

```bash
# Отредактируйте email в nginx/ssl-setup.sh
nano nginx/ssl-setup.sh

# Запустите скрипт
chmod +x nginx/ssl-setup.sh
sudo ./nginx/ssl-setup.sh
```

### Вариант B: Ручной

```bash
# Остановите Nginx временно
sudo systemctl stop nginx

# Получите сертификат
sudo certbot certonly --standalone \
    -d vgk-perv.ru \
    --email your-email@example.com \
    --agree-tos \
    --non-interactive

# Запустите Nginx обратно
sudo systemctl start nginx
```

## Шаг 3: Настройка Nginx

```bash
# Скопируйте конфигурацию
sudo cp nginx/nginx.conf /etc/nginx/sites-available/edatrat

# Создайте симлинк
sudo ln -s /etc/nginx/sites-available/edatrat /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
sudo nginx -t

# Если все ОК, перезагрузите Nginx
sudo systemctl reload nginx
```

## Шаг 4: Обновление переменных окружения

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

## Шаг 5: Обновление конфигурации приложения

После изменения переменных окружения перезапустите приложение:

```bash
# Если используете Docker
docker compose down
docker compose up -d

# Если запускаете локально
# Остановите процессы (Ctrl+C) и запустите заново
npm run dev
```

## Шаг 6: Проверка работы

1. Откройте в браузере: `https://vgk-perv.ru`
2. Проверьте, что нет предупреждений о сертификате
3. Проверьте API: `https://vgk-perv.ru/api/health`

## Автообновление сертификатов

Let's Encrypt сертификаты действительны 90 дней. Certbot автоматически обновляет их, но можно проверить:

```bash
# Проверка автообновления
sudo certbot renew --dry-run

# Ручное обновление
sudo certbot renew
```

## Troubleshooting

### Ошибка: "certificate not found"

Убедитесь, что сертификат получен:
```bash
sudo ls -la /etc/letsencrypt/live/vgk-perv.ru/
```

### Ошибка: "502 Bad Gateway"

Проверьте, что приложение запущено:
```bash
# Проверьте порты
sudo netstat -tlnp | grep -E '27015|3001'

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/edatrat-error.log
```

### Ошибка: "SSL certificate problem"

Проверьте права доступа к сертификатам:
```bash
sudo chmod 644 /etc/letsencrypt/live/vgk-perv.ru/fullchain.pem
sudo chmod 600 /etc/letsencrypt/live/vgk-perv.ru/privkey.pem
```

## Структура портов после настройки

- **Порт 80 (HTTP)**: Nginx → редирект на HTTPS
- **Порт 443 (HTTPS)**: Nginx → проксирует на:
  - `localhost:27015` (Frontend)
  - `localhost:3001` (Backend API)
- **Порт 27015**: Frontend (только локально)
- **Порт 3001**: Backend API (только локально)

## Безопасность

После настройки HTTPS:
- ✅ Все HTTP запросы автоматически перенаправляются на HTTPS
- ✅ Включен HSTS (Strict-Transport-Security)
- ✅ Настроены безопасные SSL протоколы
- ✅ Защита от XSS и других атак через заголовки

