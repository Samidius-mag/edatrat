#!/bin/bash
# Скрипт для проверки подключения к сервисам

echo "=== Проверка подключения к сервисам ==="
echo ""

echo "1. Проверка Frontend (27015):"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:27015 | grep -q "200\|404"; then
    echo "   ✅ Frontend доступен"
    curl -s http://localhost:27015 | head -5
else
    echo "   ❌ Frontend недоступен"
    curl -v http://localhost:27015 2>&1 | head -10
fi

echo ""
echo "2. Проверка Backend (3001):"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health | grep -q "200"; then
    echo "   ✅ Backend доступен"
    curl -s http://localhost:3001/api/health
    echo ""
else
    echo "   ❌ Backend недоступен"
    curl -v http://localhost:3001/api/health 2>&1 | head -10
fi

echo ""
echo "3. Проверка от имени пользователя Nginx:"
if sudo -u www-data curl -s -o /dev/null -w "%{http_code}" http://localhost:27015 | grep -q "200\|404"; then
    echo "   ✅ Nginx может подключиться к Frontend"
else
    echo "   ❌ Nginx НЕ может подключиться к Frontend"
fi

if sudo -u www-data curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health | grep -q "200"; then
    echo "   ✅ Nginx может подключиться к Backend"
else
    echo "   ❌ Nginx НЕ может подключиться к Backend"
fi

echo ""
echo "4. Проверка логов Nginx:"
if [ -f /var/log/nginx/edatrat-error.log ]; then
    echo "   Последние ошибки:"
    sudo tail -5 /var/log/nginx/edatrat-error.log | sed 's/^/   /'
else
    echo "   ⚠️  Файл логов не найден"
fi

echo ""
echo "=== Проверка завершена ==="

