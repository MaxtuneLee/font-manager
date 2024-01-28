FROM node:18

# Create app directory
WORKDIR /app

# Bundle files
COPY . .

ENV NODE_ENV=production

# Make the script executable
RUN chmod +x /app/migrate-and-start.sh

RUN npm config set registry https://registry.npmmirror.com/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm dlx prisma generate

# Expose port 3000
EXPOSE 3000
EXPOSE 5555

# Start app
CMD ["/bin/sh", "-c", "./migrate-and-start.sh"]
