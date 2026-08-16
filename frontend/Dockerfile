# Stage 1: build the static bundle
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Baked in at build time — see vite.config.js and src/services/api.js.
# VITE_BASE_PATH must match the path the university's public Nginx routes
# this project under (e.g. /trackly/). VITE_API_URL is the same path without
# the trailing slash — axios prefixes it onto the existing /api/... calls,
# so requests end up same-origin as /trackly/api/... and never hit CORS.
ARG VITE_BASE_PATH=/trackly/
ARG VITE_API_URL=/trackly
ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: serve the built files
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
