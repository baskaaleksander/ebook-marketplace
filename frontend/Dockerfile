FROM node:20 as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app ./
EXPOSE 3000

ENV NODE_ENV=production
CMD ["npm", "start"]
