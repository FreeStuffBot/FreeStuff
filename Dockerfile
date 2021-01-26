FROM node:alpine

RUN apk add git

WORKDIR /opt/greenlight/bot

ENV NODE_ENV=production

ENV NO_SHARDING=true

COPY package*.json ./

#RUN npm install --only=production
RUN npm install

COPY . .

RUN npm run build

CMD [ "npm", "start" ]
