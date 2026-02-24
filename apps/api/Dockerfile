FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json apps/api/
COPY apps/web/package*.json apps/web/

RUN npm install

COPY . .

RUN npm run prisma:generate -w apps/api && npm run build -w apps/api

EXPOSE 3001

CMD ["sh", "-c", "npm run db:deploy -w apps/api && npm run seed -w apps/api && npm run start:prod -w apps/api"]
