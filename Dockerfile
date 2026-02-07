# ========= Stage 1: Build =========
FROM node:20-alpine AS build

WORKDIR /app

# Copy lock & package trước để cache
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build Vite
RUN npm run build


# ========= Stage 2: Nginx =========
FROM nginx:alpine

# Xoá config mặc định
RUN rm /etc/nginx/conf.d/default.conf

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy dist từ stage build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
