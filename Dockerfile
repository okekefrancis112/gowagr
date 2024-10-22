# Stage 1: Build TypeScript
FROM node:18-alpine AS Base
# FROM python3:alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# Build TypeScript
RUN npm run build

RUN ls /app

# prod-ready stage
FROM node:18-alpine

WORKDIR /app

COPY --from=Base /app .

RUN ls /app

# Expose port (if needed)
EXPOSE 1444

# Start the application
CMD ["npm", "start"]
