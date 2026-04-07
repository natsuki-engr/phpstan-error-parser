FROM php:8.3-cli

RUN apt-get update && apt-get install -y git unzip \
    && rm -rf /var/lib/apt/lists/*

RUN pecl install uopz && docker-php-ext-enable uopz

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
