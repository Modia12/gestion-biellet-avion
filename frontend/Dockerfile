FROM node:18-alpine AS build-stage

WORKDIR /app
COPY front/ ./

RUN npm install
RUN npm run build

# ==== STAGE 2 : Serveur Nginx ====
FROM nginx:alpine

# Supprimer la page par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copier le build réel du front
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copier une config nginx si nécessaire
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]