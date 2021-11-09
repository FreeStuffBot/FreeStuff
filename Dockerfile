##### Base #####

FROM node:16-alpine as base

# Install Git because it's needed by the bot to determine it's own version
RUN apk add git

WORKDIR /app

# Copy the package meta files
COPY package*.json ./

# Setup stuff to be able to use private packages
ARG NODE_AUTH_TOKEN
ENV NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN
COPY gh.npmrc .npmrc

# Install production dependencies
RUN npm install --production

##### BUILD #####

FROM base as builder

WORKDIR /app

# Install all the dependencies
RUN npm install

# Copy the source-code
COPY src ./src
COPY tsconfig.json ./

# Build the project
RUN npm run build

##### PRODUCTION IMAGE #####

FROM base

WORKDIR /app

# Copy the configuration file
COPY config.docker.js config.js

# Copy the transpiled source-code
COPY --from=builder /app/build ./build

# Copy the .git directory
COPY .git ./.git

# Launch the bot
CMD [ "npm", "start" ]
