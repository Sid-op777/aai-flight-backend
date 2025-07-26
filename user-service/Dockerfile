# ---- Build Stage ----
# This stage installs all dependencies (including dev) and builds the TypeScript code.
FROM node:18-alpine AS build
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies, including devDependencies, needed for the build
RUN npm install

# Copy the rest of the source code
COPY . .

# Run the build command to compile TypeScript to JavaScript
RUN npm run build


# ---- Production Stage ----
# This stage creates the final, lean image for production.
FROM node:18-alpine AS production
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --only=production

# Copy the compiled code (the 'dist' folder) from the 'build' stage
COPY --from=build /usr/src/app/dist ./dist

# The command to run the application
CMD [ "node", "dist/index.js" ]