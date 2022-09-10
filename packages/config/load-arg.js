const fs = require('fs')
let devConfig
try { devConfig = require('./dev-config') } catch (ex) { }

const secretPrefix = 'FSB_'
const secretSuffix = ''


module.exports = function loadArg(name) {
  const extName = secretPrefix + name + secretSuffix

  if (devConfig?.env[ name ] !== undefined)
    return devConfig.env[ name ];
  else if (fs.existsSync(`/run/secrets/${extName}`))
    return fs.readFileSync('/run/secrets/' + extName).toString();
  else
    return process.env[ extName ];
}
