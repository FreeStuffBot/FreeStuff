const axios = require('axios')
const config = require('../config.js')

if (!config) throw new Error('Config not found. Please cd into /scripts')

const token = config.bot.token
const clientid = config.bot.clientid

async function run() {
  const opts = {
    headers: { Authorization: `Bot ${token}` }
  }

  const { data } = await axios.get(`https://discord.com/api/v8/applications/${clientid}/commands`, opts)

  await Promise.all(data.map(d => axios.delete(`https://discord.com/api/v8/applications/${clientid}/commands/${d.id}`, opts)))

  axios.post(`https://discord.com/api/v8/applications/${clientid}/commands`, {
    name: 'free',
    description: 'View games that are currently 100% off! Visit https://freestuffbot.xyz/ for more info!'
  }, opts)
}
run()
