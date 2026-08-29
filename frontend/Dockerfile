# ============================================
# Stage 1: Build
# ============================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build


# ============================================
# Stage 2: Production
# ============================================
FROM nginx:1.27-alpine AS production

RUN apk update \
    && apk upgrade \
    && rm -rf /var/cache/apk/*

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
