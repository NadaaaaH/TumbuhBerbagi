# --- Stage 1: Build React Assets ---
FROM node:20-alpine AS node-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY resources/ ./resources/
COPY jsconfig.json vite.config.js postcss.config.js tailwind.config.js ./
COPY public/ ./public/
RUN npm run build

# --- Stage 2: PHP & Nginx Runtime ---
FROM richarvey/nginx-php-fpm:php82

# Copy repository files
COPY . .

# Copy compiled React assets from Stage 1
COPY --from=node-builder /app/public/build ./public/build

# Image configurations for richarvey/nginx-php-fpm
ENV SKIP_COMPOSER 1
ENV WEBROOT /var/www/html/public
ENV PHP_ERRORS_STDERR 1
ENV RUN_SCRIPTS 1
ENV REAL_IP_HEADER 1

# Default Laravel Env
ENV APP_ENV production
ENV APP_DEBUG false
ENV LOG_CHANNEL stderr

# Install composer dependencies
ENV COMPOSER_ALLOW_SUPERUSER 1
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
