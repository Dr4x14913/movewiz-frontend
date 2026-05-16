# Build stage
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build-only

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/nginx.conf.template
COPY nginx/start.sh /start.sh
RUN chmod +x /start.sh
EXPOSE 80
ENTRYPOINT ["/start.sh"]
