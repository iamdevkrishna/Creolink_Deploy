# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

# Set the production API URL during the Vite build process Let the container know where the backend is
ENV VITE_API_BASE_URL=https://creolink-backend.onrender.com
# Set the frontend URL for copying the Magic Link from the Dashboard
ENV VITE_FRONTEND_URL=https://creolink-frontend.onrender.com

RUN npm run build

# Production stage using Nginx
FROM nginx:alpine

# Copy built react app to Nginx serve directory
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default Nginx config to handle React Router client-side routing
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