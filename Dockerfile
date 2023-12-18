#Base Image - Smaller most stable node image; larger: node:19-bullseye
FROM node:19-bullseye-slim 

# Use this path as defulat location to run commands
WORKDIR /app

# Copy files from local location into docker location
COPY server /app/server
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

# Install dependencies
RUN npm install

# Run the app when the container launches
CMD ["npm", "start"]