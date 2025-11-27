#!/bin/bash
# Скрипт для настройки SSL сертификатов через Let's Encrypt

DOMAIN="vgk-perv.ru"
EMAIL="your-email@example.com"  # Замените на ваш email

echo "Настройка SSL сертификатов для $DOMAIN"

# Установка certbot (если еще не установлен)
if ! command -v certbot &> /dev/null; then
    echo "Установка certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Создание директории для certbot
sudo mkdir -p /var/www/certbot

# Получение сертификата
echo "Получение SSL сертификата от Let's Encrypt..."
sudo certbot certonly --webroot \
    -w /var/www/certbot \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --non-interactive

# Проверка сертификата
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ Сертификат успешно получен!"
    echo "Путь к сертификату: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
else
    echo "❌ Ошибка получения сертификата"
    exit 1
fi

# Настройка автообновления
echo "Настройка автообновления сертификатов..."
sudo certbot renew --dry-run

echo "✅ Настройка завершена!"
echo "Не забудьте:"
echo "1. Скопировать nginx.conf в /etc/nginx/sites-available/edatrat"
echo "2. Создать симлинк: sudo ln -s /etc/nginx/sites-available/edatrat /etc/nginx/sites-enabled/"
echo "3. Проверить конфигурацию: sudo nginx -t"
echo "4. Перезагрузить Nginx: sudo systemctl reload nginx"

