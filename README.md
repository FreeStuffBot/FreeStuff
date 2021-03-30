
# FreeStuff Bot

[https://freestuffbot.xyz/](https://freestuffbot.xyz/)

[![CodeFactor](https://www.codefactor.io/repository/github/freestuffbot/discord/badge)](https://www.codefactor.io/repository/github/freestuffbot/discord)
![Node.js CI](https://github.com/TudeTeam/freestuff-bot/workflows/Node.js%20CI/badge.svg)
[![Discord Bots](https://top.gg/api/widget/status/672822334641537041.svg)](https://top.gg/bot/672822334641537041)
[![Discord Bots](https://top.gg/api/widget/servers/672822334641537041.svg?noavatar=true)](https://top.gg/bot/672822334641537041)

^ code quality is A; please keep it that way when PR-ing :)

## Git branches

**master** As the stable, production ready branch. Deploys run right from master.

**dev** As the development, not-necessarily-stable-but-preferably-stable branch. Please pr here.

## Trello

Roadmap, Todo, Suggestions, etc: https://trello.com/b/Zhw6umTy/freestuff

## Running the bot

#### Preperation:

Make sure to have typescript installed globally or modify the building scripts accordingly.

Make sure to `npm i` after cloning.

In the root directory, rename the file `config.template.js` to `config.js`. Open the file and edit it:

`bot.token` is your discord bot token.

`mongodb.url` is the url of your mongodb instance.

`redis` are settings for the redis server. Can be left empty to use default settings.

`thirdparty.topgg.apitoken` is the api token from top.gg.

`thirdparty.sentry.dsn` is your sentry dsn token. This token can be found in the process of setting up a new sentry project.

`apisettings` are the settings for the freestuff api. This object gets used as the settings for initialising the API wrapper instance.

`supportWebhook` is a discord webhook url which all _@FreeStuff here_ queries will end up.

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

#### Support

If you need any help, feel free to ask in our [discord server](https://freestuffbot.xyz/discord). Unfortunately we cannot guarantee to be able to help you with any problem that might occur.


## License

The FreeStuff Bot for Discord notifies you about free games right in your Discord server.
Copyright (C) 2020 - 2021 FreeStuff Contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.