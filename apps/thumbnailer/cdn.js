const crypto = require('crypto')
const axios = require('axios')
const FormData = require('form-data')
const config = require('./config')


exports.uploadImageToDiscordCdn = async (base64) => {
  const data = Buffer.from(base64, 'base64')
  const name = `freestuff-thumbnail-${crypto.randomBytes(6).toString('base64')}.png`

  const messageObject = {
    attachments: [
      { id: 0, filename: name }
    ]
  }

  const form = new FormData()
  form.append('files[0]', data, name)
  form.append('payload_json', JSON.stringify(messageObject))

  const res = await axios.post(
    `https://discord.com/api/v10/channels/${config.discordCdnChannel}/messages`,
    form,
    {
      headers: {
        'content-type': `multipart/form-data; boundary=${form._boundary}`,
        authorization: `Bot ${config.discordToken}`
      }
    }
  )

  if (res.status < 200 || res.status >= 300)
    return null

  return res.data.attachments[0].url
}