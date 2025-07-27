# ---- Build Stage ----
FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --only=production
COPY --from=build /usr/src/app/dist ./dist
# The command to run our consumer script
CMD [ "node", "dist/index.js" ]