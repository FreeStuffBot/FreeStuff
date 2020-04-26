FROM node:10

WORKDIR /usr/src/app

ENV NODE_ENV production

COPY package*.json ./

RUN npm install --only=production

COPY . .

RUN npm run build
