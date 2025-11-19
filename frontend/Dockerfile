# Stage 1: build
FROM node:18-alpine AS build-stage

WORKDIR /app

# Copier package.json pour installer les dépendances
COPY package*.json ./

RUN npm install

# Copier tout le code frontend
COPY . .

# Construire le frontend (génère /dist)
RUN npm run build

# Stage 2: production avec Nginx
FROM nginx:alpine

# Copier le build vers Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Exposer le port 80 (docker-compose le mappe sur 8084)
EXPOSE 80

# Commande Nginx
CMD ["nginx", "-g", "daemon off;"]
