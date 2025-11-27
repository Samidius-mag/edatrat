#!/bin/bash
# Скрипт для проверки работы сервисов

echo "=== Проверка работы сервисов ЕмПоСезону ==="
echo ""

# Проверка портов
echo "1. Проверка портов:"
if sudo netstat -tlnp 2>/dev/null | grep -q ':27015'; then
    echo "   ✅ Frontend (27015) - работает"
    sudo netstat -tlnp 2>/dev/null | grep ':27015'
else
    echo "   ❌ Frontend (27015) - НЕ работает"
fi

if sudo netstat -tlnp 2>/dev/null | grep -q ':3001'; then
    echo "   ✅ Backend (3001) - работает"
    sudo netstat -tlnp 2>/dev/null | grep ':3001'
else
    echo "   ❌ Backend (3001) - НЕ работает"
fi

echo ""

# Проверка доступности
echo "2. Проверка доступности:"
echo "   Frontend:"
if curl -s http://localhost:27015 > /dev/null 2>&1; then
    echo "   ✅ http://localhost:27015 - доступен"
else
    echo "   ❌ http://localhost:27015 - недоступен"
fi

echo "   Backend:"
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "   ✅ http://localhost:3001/api/health - доступен"
    curl -s http://localhost:3001/api/health | head -1
else
    echo "   ❌ http://localhost:3001/api/health - недоступен"
fi

echo ""

# Проверка Nginx
echo "3. Проверка Nginx:"
if sudo systemctl is-active --quiet nginx; then
    echo "   ✅ Nginx - запущен"
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        echo "   ✅ Конфигурация Nginx - валидна"
    else
        echo "   ❌ Конфигурация Nginx - ОШИБКИ:"
        sudo nginx -t
    fi
else
    echo "   ❌ Nginx - НЕ запущен"
fi

echo ""

# Проверка последних ошибок
echo "4. Последние ошибки Nginx (если есть):"
if [ -f /var/log/nginx/edatrat-error.log ]; then
    ERRORS=$(sudo tail -5 /var/log/nginx/edatrat-error.log)
    if [ -z "$ERRORS" ]; then
        echo "   ✅ Ошибок нет"
    else
        echo "   ⚠️  Последние ошибки:"
        echo "$ERRORS" | sed 's/^/   /'
    fi
else
    echo "   ⚠️  Файл логов не найден"
fi

echo ""
echo "=== Проверка завершена ==="

