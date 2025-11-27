# Исправление конфликта конфигурации Nginx

## Проблема

Nginx показывает предупреждения:
```
nginx: [warn] conflicting server name "vgk-perv.ru" on 0.0.0.0:80, ignored
nginx: [warn] conflicting server name "vgk-perv.ru" on 0.0.0.0:443, ignored
```

Это означает, что есть несколько конфигураций с одинаковым `server_name`.

## Диагностика

### Шаг 1: Найдите все конфигурации с vgk-perv.ru

```bash
# Найдите все файлы с server_name vgk-perv.ru
sudo grep -r "server_name.*vgk-perv.ru" /etc/nginx/

# Посмотрите активные конфигурации
ls -la /etc/nginx/sites-enabled/
```

### Шаг 2: Проверьте содержимое конфигураций

```bash
# Проверьте каждую активную конфигурацию
for file in /etc/nginx/sites-enabled/*; do
    echo "=== $file ==="
    grep -A 2 "server_name" "$file"
    echo ""
done
```

## Решение

### Вариант 1: Удалить дублирующие конфигурации

```bash
# 1. Посмотрите все активные конфигурации
ls -la /etc/nginx/sites-enabled/

# 2. Найдите конфигурации с vgk-perv.ru (кроме edatrat)
sudo grep -l "vgk-perv.ru" /etc/nginx/sites-enabled/*

# 3. Удалите или переименуйте дубликаты
# Например, если есть default или другая конфигурация:
sudo rm /etc/nginx/sites-enabled/default
# или
sudo mv /etc/nginx/sites-enabled/old-config /etc/nginx/sites-available/old-config.backup

# 4. Убедитесь, что осталась только одна конфигурация
ls -la /etc/nginx/sites-enabled/
```

### Вариант 2: Использовать только нашу конфигурацию

```bash
# 1. Удалите все активные конфигурации (кроме edatrat)
cd /etc/nginx/sites-enabled/
sudo rm -f default
sudo rm -f *  # Удалите все, если уверены

# 2. Создайте только нашу конфигурацию
sudo ln -s /etc/nginx/sites-available/edatrat /etc/nginx/sites-enabled/edatrat

# 3. Проверьте
sudo nginx -t
```

### Вариант 3: Объединить конфигурации

Если в других конфигурациях есть нужные настройки, объедините их в один файл.

## После исправления

```bash
# 1. Проверьте конфигурацию
sudo nginx -t

# Должно быть без предупреждений:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# 2. Перезагрузите Nginx
sudo systemctl reload nginx

# 3. Проверьте статус
sudo systemctl status nginx

# 4. Проверьте логи
sudo tail -f /var/log/nginx/edatrat-error.log
```

## Проверка работы

```bash
# Проверьте доступность
curl -I https://vgk-perv.ru
curl https://vgk-perv.ru/api/health
```

## Частые случаи

### Случай 1: Дефолтная конфигурация Nginx

Если есть `/etc/nginx/sites-enabled/default` с server_name vgk-perv.ru:

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Случай 2: Старая конфигурация от certbot

Если certbot создал свою конфигурацию:

```bash
# Найдите конфигурации certbot
sudo ls -la /etc/nginx/sites-enabled/ | grep certbot

# Удалите или переименуйте
sudo rm /etc/nginx/sites-enabled/certbot-config
```

### Случай 3: Несколько конфигураций проекта

Если есть несколько версий конфигурации:

```bash
# Посмотрите все
ls -la /etc/nginx/sites-enabled/

# Оставьте только одну (самую новую)
sudo rm /etc/nginx/sites-enabled/edatrat.old
```

## Автоматическое исправление

```bash
# Запустите скрипт диагностики
chmod +x ~/edatrat/scripts/fix-nginx-conflict.sh
sudo ~/edatrat/scripts/fix-nginx-conflict.sh
```

После этого вручную удалите дублирующие конфигурации.

