# build do React
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Nginx servindo os arquivos
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expondo a porta 80
EXPOSE 80

# Rodar Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]