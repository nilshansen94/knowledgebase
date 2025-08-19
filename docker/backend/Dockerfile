FROM node:20-alpine

WORKDIR /app

COPY dist/backend/package*.json ./
RUN npm install --only=production
RUN npm install pg

COPY dist/backend .

EXPOSE 3000
CMD ["node", "main.js"]
