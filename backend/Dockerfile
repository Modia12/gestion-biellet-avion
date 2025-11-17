FROM node:18

# Installer bash pour que Jenkins puisse exécuter des scripts shell
RUN apt-get update && apt-get install -y bash

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
