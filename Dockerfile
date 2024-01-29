FROM node:18

# Create app directory
WORKDIR /app

COPY package.json .

RUN npm config set registry https://registry.npmmirror.com/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Bundle files
COPY . .

ENV NODE_ENV=production

# Make the script executable
RUN chmod +x /app/migrate-and-start.sh
RUN pnpm dlx prisma generate

# Expose port 3000
EXPOSE 3000
EXPOSE 5555

# Start app
CMD source ./migrate-and-start.sh
