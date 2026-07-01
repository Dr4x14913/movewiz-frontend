# Build stage
FROM node:24-alpine AS build
ARG BACKEND_BASE_URL
ENV BACKEND_BASE_URL=${BACKEND_BASE_URL}
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build-only

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
