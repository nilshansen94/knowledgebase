FROM --platform=$BUILDPLATFORM node:20-alpine

WORKDIR /app

COPY dist/backend/package.json ./
COPY dist/backend/package-lock.json ./
RUN npm ci
RUN npm install pg

COPY dist/backend .

EXPOSE 3000
CMD ["node", "main.js"]
