FROM node:alpine AS builder
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo@1.4.3
COPY . .
RUN turbo prune --scope=@freestuffbot/manager --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:alpine AS installer
RUN apk update
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install

FROM node:alpine AS sourcer
RUN apk update
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=builder /app/out/full/ .
COPY .gitignore .gitignore
# unfortunately the dockerode module has some dependency on node-gyp...
# RUN apk add --no-cache --virtual .build-deps alpine-sdk python3
RUN yarn turbo run build --scope=@freestuffbot/manager --include-dependencies --no-deps
# RUN apk del .build-deps

EXPOSE 80
ENTRYPOINT [ "yarn", "run-manager" ]
