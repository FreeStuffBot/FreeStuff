
> **DEPRECATION NOTICE**
>
> This is the old freestuff bot for discord that uses discord.js to build a gateway connection to discord's api. The new bot consits of multiple microservices using discord's new "interactions api" without opening any gateway connections, resulting in faster deploys, better scaleability and stability, and easier maintenance.
>
> The code in this repo should still work for the most part but does not get any support or updates going forward.


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

## Running the bot using Docker

1. Download the docker-compose.yml file
2. Edit the environment variables accordingly
3. Pick one mode to run:
   * **single** — is probably what you wanna go for as it just starts one shard and you don't have to worry about anything
   * **shard** — if you need multiple shards, use this mode to specify which ones and how many you want to start
   * **worker** — unless you have a custom manager service this mode will only put the bot in limbo, making it wait forever. You don't wanna use this
4. If you want realtime updates you want to start the webhook server. Settings should be self explanatory. If you cannot publish a server for some reason, you have two alternative options:
   * Don't have real-time announcements. In this case you can only really use the /free command
   * Edit the code to poll and publish announcements through the API. Look at the next section for running the bot from source
5. Register slash commands and init database
   * Run `node ./scripts/register-commands.js`
   * Run `node ./scripts/initdb.js`


## Running the bot from source

#### Prerequisites

This bot uses discord.js v13 which required **NodeJS v16.0.0** or up.

#### Preperation

Make sure to have typescript installed globally or modify the building scripts accordingly.

Run `npm i` or `yarn install` after cloning.

In the root directory, rename the file `config.template.js` to `config.js`. Open the file and edit it accordingly.

Now go to /scripts and run the initdb.js file using nodejs: `node ./initdb.js`. Make sure to configure your MongoDB connection in config.js before running this script.

You probably also want to register the slash commands by running the `node ./register-commands.js` command in the same directory.

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


## Contributors

* Andreas May, [@maanex](https://github.com/maanex) — Basically the whole thing
* Seyhan Halil, [@EasyThe](https://github.com/EasyThe) — Bug fixes
* Rami Sabbagh, [@Rami-Sabbagh](https://github.com/Rami-Sabbagh) — Documentation and Docker magic


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