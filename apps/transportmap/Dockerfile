# Stage 0: Build Angular
FROM node:hydrogen-alpine AS build

RUN apk add --no-cache python3 build-base

WORKDIR /usr/build
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run nx run transportmap:build

# Stage 1: Serve Angular
FROM nginx:1.21.0-alpine

COPY --from=build /usr/build/dist/apps/transportmap/. /usr/share/nginx/html
COPY apps/transportmap/nginx.conf /etc/nginx/nginx.template
COPY apps/transportmap/docker-entrypoint.sh /
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
