const fs = require('fs')
const devConfig = require('./dev-config')


module.exports = function loadArg(name) {
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