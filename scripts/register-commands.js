/* eslint-disable no-console */
const axios = require('axios')
const loadArg = require('../packages/config/load-arg')

if (!loadArg) throw new Error('Config not found. Please cd into /scripts')

const token = loadArg('DISCORD_GATEWAY_API_TOKEN')
const clientid = loadArg('DISCORD_GATEWAY_API_USER')

const commands = [
  {
    name: 'about',
    description: 'Get info about the FreeStuff Bot.'
  },
  {
    name: 'free',
    description: 'Get a list of games that are currently 100% off!'
  },
  {
    name: 'help',
    description: 'Get help for the FreeStuff Bot.'
  },
  {
    name: 'invite',
    description: 'Would you like to get this bot in your own server?'
  },
  {
    name: 'settings',
    description: 'Change settings for the FreeStuff Bot.'
  },
  {
    name: 'vote',
    description: 'Support the bot by voting for it on a Discord bot list of your choice!'
  }
]

async function run(remove = true, add = true, whitelist) {
  const opts = {
    headers: { Authorization: `Bot ${token}` }
  }

  const { data } = await axios.get(`https://discord.com/api/v8/applications/${clientid}/commands`, opts)

  if (remove) {
    await Promise.all(data
      .filter(d => !whitelist || whitelist.includes(d.name))
      .map(d => axios.delete(`https://discord.com/api/v8/applications/${clientid}/commands/${d.id}`, opts))
    )
  }

  let delay = 0
  if (add) {
    for (const command of commands) {
      if (whitelist && !whitelist.includes(command.name)) continue
      setTimeout(() => {
        axios
          .post(`https://discord.com/api/v8/applications/${clientid}/commands`, command, opts)
          .catch(err => console.error(err.response.status, command.name, JSON.stringify(err.response.data, null, 2)))
        console.log('Registered command %s', command.name)
      }, delay += 1000)
    }
    setTimeout(() => console.log('Done.'), delay + 100)
  }
}
run(false, true)
