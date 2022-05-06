const fs = require('fs')
let devConfig
try { devConfig = require('./dev-config') } catch (ex) {}

const secretPrefix = 'FSB_'
const secretSuffix = ''


module.exports = function loadArg(name) {
  const extName = secretPrefix + name + secretSuffix
  try {
    if (!devConfig || devConfig.env[name] === undefined)
      throw new Error()
    return devConfig.env[name]
  } catch (ex) {
    try {
      return fs.readFileSync('/run/secrets/' + extName).toString()
    } catch (ex) {
      return process.env[extName]
    }
  }
}