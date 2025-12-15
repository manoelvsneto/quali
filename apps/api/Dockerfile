FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

RUN mkdir -p /app/uploads

EXPOSE 4000

CMD ["npm", "start"]
