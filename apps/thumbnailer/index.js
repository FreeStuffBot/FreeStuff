const express = require('express')
const config = require('./config.js')
const { generateImage } = require('./generator.js')
const { uploadImageToDiscordCdn } = require('./cdn.js')

const port = config.port || 5051

const app = express()
app.use(require('helmet')())
app.use(express.json())
app.listen(port, () => console.log(`Server listening on port ${port}`))

// Server

app.post('/render', async (req, res) => {
  if (!req.body) return res.status(400).end()

  const image = await generateImage(req.body)
    .catch(ex => void res.status(ex.status || 500).json({ error: ex.message || 'internal server error' }))
  if (!image) return

  const url = await uploadImageToDiscordCdn(image)
    .catch(ex => void res.status(500).json({ error: ex.message, details: (ex.response || {}).data }))
  if (!url) return

  res.status(200).json({ url })
})

app.get('/', (_, res) => res.redirect('https://github.com/FreeStuffBot/thumbnailer'))

app.all('*', (_, res) => {
  return res.status(404).json({ error: 'not found' })
})
