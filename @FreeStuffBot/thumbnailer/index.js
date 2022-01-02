const express = require('express')
const { config: loadDotenv } = require('dotenv')
const isDocker = require('is-docker')

// Setup

if (!isDocker()) loadDotenv()

const { generateImage } = require('./generator.js')

const app = express()
const port = process.env.PORT || 5051
// app.use(require('morgan')('tiny'))
app.use(require('helmet')())
app.use(express.json())
app.listen(port, () => console.log(`Server listening on port ${port}`))

// Server

app.post('/render', async (req, res) => {
  if (!req.body) return

  generateImage(req.body)
    .then(image => sendBuffer(image, res))
    .catch(ex => res.status(ex.status || 500).json({ error: ex.message || 'internal server error' }))
})

app.get('/', (_, res) => res.redirect('https://github.com/FreeStuffBot/thumbnailer'))

app.all('*', (_, res) => {
  return res.status(404).json({ error: 'not found' })
})

//

function sendBuffer(base64, res) {
  const buffer = Buffer.from(base64, 'base64')
  res
    .status(200)
    .header({
      'Content-Type': 'image/png',
      'Content-Length': buffer.length
    })
    .end(buffer)
}

function parseToken(token) {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString())
  } catch(ex) {
    return null
  }
}

