# Use an official Node.js runtime with TypeScript support as the base image
FROM node:18.16.0

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

RUN npm install ts-node --save

# Install TypeScript globally
RUN npm install -g typescript

RUN npm install -g nodemon

# Compile TypeScript code to JavaScript (adjust the command as needed)
RUN tsc

RUN apt-get update && apt-get install -y nginx

# Expose a port that your application will listen on
EXPOSE 80


# Remove default NGINX configuration
RUN rm /etc/nginx/sites-enabled/default

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/

# Define the command to run your compiled JavaScript file
CMD service nginx start && npm start
