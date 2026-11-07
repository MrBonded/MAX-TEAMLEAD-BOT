# Образ Node.js LTS для сборки и запуска веб-приложения Mini App
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем описание зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Копируем исходный код проекта
COPY . .

# Собираем клиентскую часть Vite для продакшена (создает папку dist)
RUN npm run build

# Открываем порт 3000
EXPOSE 3000

# Режим production
ENV NODE_ENV=production

# Запуск полностекового сервера Express (раздает dist и API endpoints)
CMD ["npx", "tsx", "server.ts"]
