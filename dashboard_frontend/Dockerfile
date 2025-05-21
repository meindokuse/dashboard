FROM node:16 as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

FROM node:16-slim

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/build .

CMD ["serve", "-s", ".", "-l", "5173"]