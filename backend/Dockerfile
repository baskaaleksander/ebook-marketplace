FROM node:20-alpine
WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

RUN npm run build

# Domyślny command
CMD ["node", "dist/main"]
