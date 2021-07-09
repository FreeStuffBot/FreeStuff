FROM node:alpine

RUN apk add git

RUN mkdir -p /usr/freestuffbot
WORKDIR /usr/freestuffbot

COPY package*.json ./

#RUN npm install --only=production
RUN npm install

COPY . .
COPY config.docker.js config.js

RUN npm run build

CMD [ "npm", "start" ]
