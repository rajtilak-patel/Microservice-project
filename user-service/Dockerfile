FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Install nodemon globally for hot reload
RUN npm install -g nodemon

# Copy rest of the app
COPY . .

# Expose application port + gRPC port + debug port
EXPOSE 3001 50051 9229

# Use nodemon in development for hot reload
CMD ["nodemon", "--inspect=0.0.0.0:9229", "src/index.js"]
