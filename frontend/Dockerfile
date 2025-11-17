FROM nginx:alpine
RUN apk add --no-cache bash
WORKDIR /usr/share/nginx/html
COPY . .
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
