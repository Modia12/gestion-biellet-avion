# Utiliser Node 18 officiel
FROM node:18

# Définir le dossier de travail
WORKDIR /app

# Installer bash (utile si tu exécutes des scripts)
RUN apt-get update \
 && apt-get install -y --no-install-recommends bash \
 && rm -rf /var/lib/apt/lists/*

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances Node
RUN npm install --production

# Copier le reste du code
COPY . .

# Définir la variable d'environnement Node
ENV NODE_ENV=production

# Exposer le port 3001 (docker-compose le mappe sur l'hôte)
EXPOSE 3001

# Commande pour démarrer le serveur
CMD ["node", "server.js"]
