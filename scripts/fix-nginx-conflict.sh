#!/bin/bash
# Скрипт для исправления конфликтов конфигурации Nginx

echo "=== Поиск конфликтующих конфигураций ==="
echo ""

echo "1. Все конфигурации с server_name vgk-perv.ru:"
sudo grep -r "server_name.*vgk-perv.ru" /etc/nginx/ 2>/dev/null

echo ""
echo "2. Активные конфигурации в sites-enabled:"
ls -la /etc/nginx/sites-enabled/

echo ""
echo "3. Содержимое активных конфигураций:"
for file in /etc/nginx/sites-enabled/*; do
    if [ -f "$file" ]; then
        echo "--- $file ---"
        grep -A 2 "server_name" "$file" 2>/dev/null || echo "Нет server_name"
        echo ""
    fi
done

echo ""
echo "=== Рекомендации ==="
echo "1. Удалите или переименуйте дублирующие конфигурации"
echo "2. Оставьте только одну конфигурацию для vgk-perv.ru"
echo "3. Проверьте: sudo nginx -t"
echo "4. Перезагрузите: sudo systemctl reload nginx"

