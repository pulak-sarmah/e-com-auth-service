FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . . 

RUN npm run build



FROM node:20-alpine as production

ENV NODE_ENV=production 

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-script

COPY --from=builder /app/dist ./

EXPOSE 5500

CMD ["node", "src/server.js"]