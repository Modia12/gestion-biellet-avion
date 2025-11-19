FROM node:18-alpine AS build-stage

WORKDIR /app

COPY . .

RUN npm install && npm run build

FROM nginx:alpine

COPY --from=build-stage /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
