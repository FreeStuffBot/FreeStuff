const axios = require('axios')
const config = require('../config.js')

if (!config) throw new Error('Config not found. Please cd into /scripts')

const token = config.bot.token
const clientid = config.bot.clientid

const commands = [
  {
    name: 'about',
    description: '"What\'s this bot about?" you ask? Well run this command to get an answer to all of your questions!'
  },
  {
    name: 'free',
    description: 'Get a list of games that are currently 100% off!'
  },
  {
    name: 'help',
    description: 'View a nice support page to help you use this bot.'
  },
  {
    name: 'invite',
    description: 'Would you like to get this bot in your own server? Run this command to find out how!'
  },
  {
    name: 'misc',
    description: 'Miscellaneous, unimportant commands the bot has to offer.'
    // freestuff on the other hand would kinda imply that this command can do everything to do with freestuff which is not the case
    // TODO hosts mydata, resend, reset, beta, here
  },
  {
    name: 'settings',
    description: 'Change settings for the FreeStuff Bot.'
  },
  {
    name: 'test',
    description: 'Send a test announcement to see if everything is working.'
    // options: [
    //   {
    //     name: 'silent',
    //     description: "BLABLABLA",
    //     type: 5,
    //     required: false
    //   }
    // ]
  },
  {
    name: 'vote',
    description: 'Support the bot by voting for it on a Discord bot list of your choice!'
  }
]

// TODO too fast, ratelimited
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

  if (add) {
    for (const command of commands) {
      if (whitelist && !whitelist.includes(command.name)) continue
      axios
        .post(`https://discord.com/api/v8/applications/${clientid}/commands`, command, opts)
        .catch(err => console.error(err.response.status, command.name, JSON.stringify(err.response.data, null, 2)))
    }
  }
}
run(false, true, [ 'settings' ])
