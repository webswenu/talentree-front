# Development Dockerfile
FROM node:18-alpine

WORKDIR /app

# La imagen corre sin root (CKV_DOCKER_3): node es el usuario sin privilegios
# que trae la imagen oficial.
RUN chown node:node /app

# Copy package files
COPY --chown=node:node package*.json ./
USER node

# Install dependencies
RUN npm install

# Copy source code
COPY --chown=node:node . .

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev", "--", "--host"]
