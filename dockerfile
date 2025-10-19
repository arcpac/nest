# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install 

# Copy all code
COPY . .

# Build Next.js app
RUN npm run build

EXPOSE 3000

# Start the app
CMD ["npm", "start"]
