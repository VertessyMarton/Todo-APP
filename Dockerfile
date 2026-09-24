# Build Angular
FROM node:24-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# Prepare the backend and include the frontend output
FROM node:24-alpine

WORKDIR /app

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

COPY --from=frontend-build /frontend/dist/frontend/browser ./public

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-c", "npm run db:migrate:deploy && npm run db:generate && exec npm start"]