# --- Step 1: Build Stage ---
    FROM node:20-alpine AS builder

    # Set working directory
    WORKDIR /app
    
    # Copy package files and install dependencies
    COPY package*.json ./
    COPY tsconfig*.json ./
    COPY next.config.* ./
    COPY .npmrc* ./
    RUN npm install
    
    # Copy rest of the project files
    COPY . .
    
    # Build the Next.js app
    RUN npm run build
    
    # --- Step 2: Run Stage ---
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    # Set NODE_ENV to production
    ENV NODE_ENV=production
    ENV PORT=3000
    
    # Copy only what we need from the builder
    COPY --from=builder /app/package*.json ./
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/next.config.* ./
    
    # Expose port 3000
    EXPOSE 3000
    
    # Start Next.js
    CMD ["npm", "start"]
    