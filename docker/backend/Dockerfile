FROM --platform=$BUILDPLATFORM node:20-alpine

WORKDIR /app

COPY dist/backend/package.json ./
COPY dist/backend/package-lock.json ./
RUN npm ci --platform=linux/arm64
RUN npm install pg --platform=linux/arm64

COPY dist/backend .

EXPOSE 3000
CMD ["node", "main.js"]
