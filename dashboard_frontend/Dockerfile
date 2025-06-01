FROM node:18

WORKDIR /app

# 1. Копируем ТОЛЬКО package.json сначала (для кэширования)
COPY project/package.json project/package-lock.json ./
RUN npm ci

# 2. Копируем ВЕСЬ остальной проект
COPY project .

# 3. Собираем проект (создаст папку dist)
RUN npm run build

RUN npm install -g serve

# 5. Запускаем сервер из папки dist
CMD ["serve", "-s", "dist", "-l", "5173"]
