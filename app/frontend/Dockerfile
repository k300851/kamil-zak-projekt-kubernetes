FROM node:25-alpine AS build

WORKDIR /app

COPY ./package.json ./
RUN npm install

COPY ./public ./public
COPY ./src ./src
COPY ./index.html ./

RUN npm run build


FROM nginxinc/nginx-unprivileged:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
