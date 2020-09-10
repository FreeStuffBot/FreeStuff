
# FreeStuff Bot

[https://freestuffbot.xyz/](https://freestuffbot.xyz/)

![Node.js CI](https://github.com/TudeTeam/freestuff-bot/workflows/Node.js%20CI/badge.svg)
[![Discord Bots](https://top.gg/api/widget/status/672822334641537041.svg)](https://top.gg/bot/672822334641537041)
[![Discord Bots](https://top.gg/api/widget/servers/672822334641537041.svg?noavatar=true)](https://top.gg/bot/672822334641537041)

## Git branches

**master** As the stable, production ready branch. Deploys run right from master.

**dev** As the development, not-necessarily-stable-but-preferably-stable branch. Please pr here.

## Trello

Roadmap, Todo, Suggestions, etc: https://trello.com/b/Zhw6umTy/freestuff

## Running the bot

#### Preperation:

In the root directory, rename the file `config.template.js` to `config.js`. Open the file and edit it:

`bot.token` is your discord bot token.

`mongodb.url` is the url of your mongodb instance.

`redis` are settings for the redis server. Can be left empty to use default settings.

`thirdparty.topgg.apitoken` is the api token from top.gg.

`thirdparty.sentry.dsn` is your sentry dsn token. This token can be found in the process of setting up a new sentry project.

`sharder` contains options for the communication with the management server. Since that server is not open source you will need to take a look in the source code to implement your own or remove it entirely.

`supportWebhook` is a discord webhook url which all _@FreeStuff here_ queries will end up.

`lang` is deprecated. This can be neglected.

`admins` is an array of discord user ids that are allowed to run admin commands.

#### Running

For development use
```sh
$ npm run dev
# OR
$ yarn dev
```

For production build first using
```sh
$ npm run build
# OR
$ yarn build
```

... and run using

```sh
$ npm start
# OR
$ yarn start
```

