# Base image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Define environment variable defaults
ENV PORT=8000

# Expose the port
EXPOSE 8000

# Start the application
CMD ["npm", "start"]