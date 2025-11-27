# Следующие шаги после проверки портов

## ✅ Статус: Сервисы запущены

Оба сервиса работают:
- ✅ Backend на порту 3001 (PID 47135)
- ✅ Frontend на порту 27015 (PID 47112)

## Диагностика проблемы 502

### Шаг 1: Проверьте доступность локально

```bash
# Проверьте frontend
curl http://localhost:27015

# Проверьте backend
curl http://localhost:3001/api/health
```

### Шаг 2: Проверьте логи Nginx

```bash
# Последние ошибки
sudo tail -20 /var/log/nginx/edatrat-error.log

# В реальном времени
sudo tail -f /var/log/nginx/edatrat-error.log
```

### Шаг 3: Проверьте, может ли Nginx подключиться

```bash
# От имени пользователя Nginx
sudo -u www-data curl http://localhost:27015
sudo -u www-data curl http://localhost:3001/api/health
```

### Шаг 4: Проверьте конфигурацию Nginx

```bash
# Проверьте синтаксис
sudo nginx -t

# Проверьте активную конфигурацию
sudo nginx -T | grep -A 5 "location /"

# Проверьте, что конфигурация загружена
ls -la /etc/nginx/sites-enabled/
cat /etc/nginx/sites-enabled/edatrat | grep -A 3 "location /"
```

## Возможные проблемы и решения

### Проблема 1: Nginx не может подключиться к localhost

**Симптомы:** В логах "Connection refused" или "Connection timeout"

**Решение:**
```bash
# Проверьте, что Nginx может подключиться
sudo -u www-data curl -v http://localhost:27015

# Если не работает, проверьте SELinux (если используется)
getenforce
```

### Проблема 2: Неправильный proxy_pass в Nginx

**Симптомы:** В логах ошибки проксирования

**Проверьте конфигурацию:**
```bash
sudo cat /etc/nginx/sites-enabled/edatrat | grep proxy_pass
```

Должно быть:
```nginx
proxy_pass http://localhost:27015;  # для frontend
proxy_pass http://localhost:3001;   # для backend
```

### Проблема 3: SSL сертификаты не найдены

**Симптомы:** В логах "SSL certificate not found"

**Решение:**
```bash
# Проверьте наличие сертификатов
sudo ls -la /etc/letsencrypt/live/vgk-perv.ru/

# Если нет, получите сертификат
sudo certbot certonly --standalone -d vgk-perv.ru
```

### Проблема 4: Nginx не перезагружен после изменений

**Решение:**
```bash
# Проверьте конфигурацию
sudo nginx -t

# Перезагрузите Nginx
sudo systemctl reload nginx

# Или полный перезапуск
sudo systemctl restart nginx
```

## Быстрая проверка всех компонентов

```bash
# 1. Сервисы запущены ✅
sudo netstat -tlnp | grep -E '27015|3001'

# 2. Локальная доступность
curl http://localhost:27015
curl http://localhost:3001/api/health

# 3. Доступность от Nginx
sudo -u www-data curl http://localhost:27015
sudo -u www-data curl http://localhost:3001/api/health

# 4. Конфигурация Nginx
sudo nginx -t

# 5. Логи Nginx
sudo tail -20 /var/log/nginx/edatrat-error.log

# 6. Статус Nginx
sudo systemctl status nginx
```

## Если все проверки пройдены, но 502 остается

1. **Проверьте, что Nginx действительно использует правильную конфигурацию:**
   ```bash
   sudo nginx -T 2>&1 | grep -A 10 "server_name vgk-perv.ru"
   ```

2. **Проверьте, нет ли других конфигураций, которые переопределяют вашу:**
   ```bash
   sudo grep -r "vgk-perv.ru" /etc/nginx/
   ```

3. **Попробуйте временно отключить SSL и проверить HTTP:**
   ```bash
   # Создайте тестовую конфигурацию без SSL
   # И проверьте, работает ли через HTTP
   ```

4. **Проверьте файрвол:**
   ```bash
   sudo ufw status
   # Порты 80 и 443 должны быть открыты
   ```

## После исправления

После того как найдете и исправите проблему:

1. Перезагрузите Nginx: `sudo systemctl reload nginx`
2. Проверьте в браузере: `https://vgk-perv.ru`
3. Проверьте API: `https://vgk-perv.ru/api/health`

