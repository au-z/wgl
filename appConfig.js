const path = require('path')
const packageJson = require('./package.json')

const env = process.env.NODE_ENV

module.exports = {
  appName: packageJson.name,
  filename: (env === 'production') ? `${packageJson.name}.min.js` : `${packageJson.name}.js`,
  entry: 'src/main.js',
  outdir: 'dist',
  port: 7070,
}
