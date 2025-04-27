# Use official Node.js LTS image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Expose the port from environment variable (default to 5000 if not set)
EXPOSE 5000

# Start the app
CMD ["node", "server.js"]