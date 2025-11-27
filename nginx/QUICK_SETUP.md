# Быстрая настройка HTTPS

## Шаг 1: Получение SSL сертификата

```bash
# Остановите Nginx (если запущен)
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

## Шаг 2: Установка конфигурации Nginx

```bash
# Скопируйте конфигурацию
sudo cp nginx/nginx.conf /etc/nginx/sites-available/edatrat

# Создайте симлинк
sudo ln -s /etc/nginx/sites-available/edatrat /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию (опционально)
sudo rm -f /etc/nginx/sites-enabled/default

# Создайте директорию для certbot
sudo mkdir -p /var/www/certbot

# Проверьте конфигурацию
sudo nginx -t
```

## Шаг 3: Перезагрузка Nginx

```bash
sudo systemctl reload nginx
```

## Шаг 4: Обновление переменных окружения

Создайте/обновите файлы `.env`:

**backend/.env:**
```env
CORS_ORIGIN=https://vgk-perv.ru
```

**frontend/.env:**
```env
VITE_API_URL=https://vgk-perv.ru/api
```

## Шаг 5: Перезапуск приложения

```bash
# Если используете Docker
docker compose down
docker compose up -d

# Если запускаете локально
# Остановите и запустите заново
```

## Проверка

Откройте в браузере: `https://vgk-perv.ru`

## Troubleshooting

Если что-то не работает:

```bash
# Проверьте логи Nginx
sudo tail -f /var/log/nginx/edatrat-error.log

# Проверьте статус Nginx
sudo systemctl status nginx

# Проверьте, что приложение запущено
curl http://localhost:27015
curl http://localhost:3001/api/health
```

