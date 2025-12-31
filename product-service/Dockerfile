FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Install nodemon globally for hot reload
RUN npm install -g nodemon

# Copy the rest of the app
COPY . .

# Expose ports (app + gRPC)
EXPOSE 3002 50052

# Use nodemon in development for hot reload
CMD ["nodemon", "--inspect=0.0.0.0:9229", "src/index.js"]
