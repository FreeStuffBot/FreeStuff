/* eslint-disable no-console */
const mongo = require('mongodb')
const config = require('../config')

const url = config.mongoDB.url || 'mongodb://localhost:27017/'
const dbname = config.mongoDB.dbname || 'freestuff'

mongo.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, run)

async function run(_, client) {
  const db = client.db(dbname)

  try {
    await db.collection('stats-usage').insertMany([
      { _id: 'announcements', value: [] },
      { _id: 'guilds', value: [] },
      { _id: 'members', value: [] },
      { _id: 'reconnects', value: [] }
    ])
  } catch (ex) { }

  try {
    await db.collection('language').insertOne({
      _id: 'en-US',
      _index: 0,
      _enabled: true,
      _meta_progress: 0,
      _meta_last_edit: 0,
      _meta_last_editor: '',
      lang_name: 'English',
      lang_name_en: 'english-us',
      date_format: 'en-us',
      currency_sign_euro_position: 'before',
      currency_sign_dollar_position: 'before'
    })
  } catch (ex) { }

  console.log('Done')
  process.exit(0)
}
