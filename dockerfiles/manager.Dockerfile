FROM node:alpine AS builder
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@freestuffbot/manager --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:alpine AS installer
RUN apk update
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
# unfortunately the dockerode module has some dependency on node-gyp...
RUN apk add --no-cache --virtual .build-deps alpine-sdk python \
RUN yarn install --production \
RUN apk del .build-deps

FROM node:alpine AS sourcer
RUN apk update
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=builder /app/out/full/ .
COPY .gitignore .gitignore
RUN yarn turbo run build --scope=@freestuffbot/manager --include-dependencies --no-deps

ENTRYPOINT [ "yarn", "run-manager" ]
