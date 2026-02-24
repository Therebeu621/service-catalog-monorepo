FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY apps/api/package*.json apps/api/
COPY apps/web/package*.json apps/web/

RUN npm install

COPY . .

RUN npm run prisma:generate -w apps/api && npm run build -w apps/api

EXPOSE 3001

CMD ["sh", "-c", "npm run db:deploy -w apps/api && npm run seed -w apps/api && npm run start:prod -w apps/api"]
