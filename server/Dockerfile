FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY client ./client

RUN npx tsc

EXPOSE 3000

CMD ["node", "dist/server/server.js"]