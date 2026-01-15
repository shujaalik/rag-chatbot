
# Stage 1: Build
FROM node:18-alpine as build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Optional: Add custom nginx config if we need to handle client-side routing fallback
# For now, default is likely okay if just root, but safe for SPA:
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
