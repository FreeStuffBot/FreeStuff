const fs = require('fs')
const devConfig = require('./dev-config')

const secretPrefix = 'FSB_'
const secretSuffix = ''


module.exports = function loadArg(name) {
  name = secretPrefix + name + secretSuffix
  try {
    if (devConfig.env[name] === undefined)
      throw new Error()
    return devConfig.env[name]
  } catch (ex) {
    try {
      return fs.readFileSync('/run/secrets/' + name).toString()
    } catch (ex) {
      return process.env[name]
    }
  }
}