# Nginx конфигурация для HTTPS

Эта директория содержит конфигурацию Nginx для работы приложения через HTTPS.

## Файлы

- `nginx.conf` - основная конфигурация Nginx с SSL
- `ssl-setup.sh` - скрипт для автоматической настройки SSL сертификатов
- `QUICK_SETUP.md` - краткая инструкция по настройке

## Быстрый старт

1. Получите SSL сертификат через certbot
2. Скопируйте `nginx.conf` в `/etc/nginx/sites-available/edatrat`
3. Создайте симлинк в `/etc/nginx/sites-enabled/`
4. Перезагрузите Nginx

Подробнее: [QUICK_SETUP.md](QUICK_SETUP.md)

## Структура

- **Порт 80**: HTTP → автоматический редирект на HTTPS
- **Порт 443**: HTTPS → проксирует на:
  - `/` → `localhost:27015` (Frontend)
  - `/api` → `localhost:3001` (Backend)

## Требования

- Nginx установлен
- Certbot установлен
- SSL сертификат получен для `vgk-perv.ru`
- Порты 80 и 443 открыты в файрволе

