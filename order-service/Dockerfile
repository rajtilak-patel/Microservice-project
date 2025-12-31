FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --silent

# Install nodemon globally for dev
RUN npm install -g nodemon

COPY . .

EXPOSE 3003 50053

# Use nodemon for development
CMD ["nodemon", "--watch", "src", "--ext", "js,json", "src/index.js"]
