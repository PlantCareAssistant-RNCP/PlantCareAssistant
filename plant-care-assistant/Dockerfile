# Use an official Node.js runtime as the base image
FROM node:23

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Ensure Prisma Client is generated before building
RUN npm run prisma:generate

# Build the Next.js app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]