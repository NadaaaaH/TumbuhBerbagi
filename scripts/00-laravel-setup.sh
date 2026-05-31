#!/bin/bash

# If using SQLite database, make sure the file exists
if [ "$DB_CONNECTION" = "sqlite" ] || [ -z "$DB_CONNECTION" ]; then
    echo "Using SQLite database. Ensuring SQLite file exists..."
    mkdir -p /var/www/html/database
    touch /var/www/html/database/database.sqlite
    chown www-data:www-data /var/www/html/database/database.sqlite
fi

# Optimization: Cache config, routes, and views
echo "Clearing old cache..."
php artisan config:clear
php artisan cache:clear
echo "Caching configurations..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations
echo "Running migrations..."
php artisan migrate --force
