const path = require('path')
const appConfig = require('./appConfig')

module.exports = {
  contentBase: path.resolve(__dirname, appConfig.outdir),
  compress: true,
  port: appConfig.port,
  noInfo: true,
}
