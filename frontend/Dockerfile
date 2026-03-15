# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add entrypoint script to inject runtime env variables
COPY docker-entrypoint.sh /docker-entrypoint.d/20-envsubst.sh
RUN chmod +x /docker-entrypoint.d/20-envsubst.sh

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
