FROM node:alpine

RUN mkdir -p /usr/thumbnailer
WORKDIR /usr/thumbnailer

RUN apk add --update --no-cache --virtual .gyp \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

COPY package*.json ./

#RUN npm install --only=production
RUN npm install

COPY . .

#RUN apk del .gyp

ENV PORT=9915

CMD [ "npm", "start" ]

EXPOSE 9915
