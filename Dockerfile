FROM node:alpine

RUN apk add git

WORKDIR /opt/freestuff/bot

ENV NODE_ENV production

COPY package*.json ./

#RUN npm install --only=production
RUN npm ci

COPY . .

RUN npm run build

CMD [ "npm", "start" ]