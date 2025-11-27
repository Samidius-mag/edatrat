# Troubleshooting 502 Bad Gateway

## Диагностика проблемы

### Шаг 1: Проверьте, что приложение запущено

```bash
# Проверьте, слушают ли порты 27015 и 3001
sudo netstat -tlnp | grep -E '27015|3001'

# Или используйте ss
sudo ss -tlnp | grep -E '27015|3001'

# Должны увидеть что-то вроде:
# tcp  0  0  0.0.0.0:27015  LISTEN  node
# tcp  0  0  0.0.0.0:3001   LISTEN  node
```

### Шаг 2: Проверьте доступность приложения локально

```bash
# Проверьте frontend
curl http://localhost:27015

# Проверьте backend
curl http://localhost:3001/api/health
```

### Шаг 3: Проверьте логи Nginx

```bash
# Ошибки Nginx
sudo tail -f /var/log/nginx/edatrat-error.log

# Доступы
sudo tail -f /var/log/nginx/edatrat-access.log
```

### Шаг 4: Проверьте конфигурацию Nginx

```bash
# Проверьте синтаксис
sudo nginx -t

# Проверьте, что конфигурация активна
ls -la /etc/nginx/sites-enabled/
```

## Решения

### Проблема: Приложение не запущено

```bash
# Запустите приложение
cd ~/edatrat
npm run dev

# Или через Docker
docker compose up -d
```

### Проблема: Приложение слушает только на 127.0.0.1

Убедитесь, что приложение слушает на `0.0.0.0`, а не только на `127.0.0.1`:

**Frontend (vite.config.js):**
```javascript
server: {
  host: '0.0.0.0',  // Важно!
  port: 27015,
}
```

**Backend:** Должен слушать на всех интерфейсах по умолчанию.

### Проблема: Неправильный proxy_pass в Nginx

Проверьте, что в `nginx.conf` указаны правильные адреса:

```nginx
location / {
    proxy_pass http://localhost:27015;  # Должно быть localhost или 127.0.0.1
}

location /api {
    proxy_pass http://localhost:3001;    # Должно быть localhost или 127.0.0.1
}
```

### Проблема: SELinux или файрвол блокирует

```bash
# Проверьте файрвол
sudo ufw status

# Если нужно, разрешите локальные подключения
sudo ufw allow from 127.0.0.1 to any port 27015
sudo ufw allow from 127.0.0.1 to any port 3001
```

### Проблема: Nginx не может подключиться

Проверьте права доступа и что Nginx может подключиться к localhost:

```bash
# Проверьте, что Nginx может подключиться
sudo -u www-data curl http://localhost:27015
sudo -u www-data curl http://localhost:3001/api/health
```

## Быстрая проверка

Выполните все команды по порядку:

```bash
# 1. Проверка портов
echo "=== Проверка портов ==="
sudo netstat -tlnp | grep -E '27015|3001'

# 2. Проверка доступности
echo "=== Проверка frontend ==="
curl -v http://localhost:27015

echo "=== Проверка backend ==="
curl -v http://localhost:3001/api/health

# 3. Проверка Nginx
echo "=== Проверка Nginx ==="
sudo nginx -t
sudo systemctl status nginx

# 4. Проверка логов
echo "=== Последние ошибки Nginx ==="
sudo tail -20 /var/log/nginx/edatrat-error.log
```

## Частые ошибки

### "Connection refused"
- Приложение не запущено
- Приложение слушает на другом порту
- Файрвол блокирует

### "Connection timeout"
- Приложение не отвечает
- Проблемы с сетью
- SELinux блокирует

### "502 Bad Gateway"
- Nginx не может подключиться к приложению
- Приложение упало
- Неправильный proxy_pass

