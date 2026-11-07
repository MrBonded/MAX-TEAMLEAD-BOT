# Используем официальный стабильный образ Node.js LTS на базе Alpine Linux
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json* ./

# Устанавливаем только production зависимости
RUN npm install --omit=dev

# Копируем исходный код бота и локальный движок
COPY bot.mjs socraticEngine.mjs ./

# Задаем пользователя без привилегий root для безопасности
USER node

# Команда запуска бота
CMD ["node", "bot.mjs"]
