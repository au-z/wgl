const appConfig = require('./appConfig')
const env = process.env.NODE_ENV

const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin

const config = {
  entry: ['babel-polyfill', 'whatwg-fetch', path.resolve(__dirname, appConfig.entry)],
  output: {
    path: path.resolve(__dirname, appConfig.outdir),
    filename: appConfig.filename,
    library: appConfig.appName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/, 
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.glsl$/,
        loader: 'webpack-glsl',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loader: {
            'scss': 'vue-style-loader!css-loader!resolve-url-loader!sass-loader',
            'sass': 'vue-style-loader!css-loader!resolve-url-loader!sass-loader?indentedSyntax',
          },
        },
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {name: '[name].[ext]?[hash]'},
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader?sourceMap',
      },
      {
        test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '^@': './src',
    },
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'lib'),
      'node_modules',
    ],
  },
  performance: {
    hints: false,
  },
  plugins: [
    new CopyWebpackPlugin([
      {from: './src/assets', to: 'assets'},
    ]),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'dist/index.html'),
      inject: 'body',
    }),
  ],
  devtool: '#eval-source-map',
  devServer: require('./devserver.config'),
}

if(env === 'production') {
  config.devtool = '#source-map'
  (config.plugins).concat([
    new webpack.DefinePlugin({'process.env': {NODE_ENV: '"production"'}}),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {warnings: false}
    }),
    new webpack.LoaderOptionsPlugin({minimize: true}),
  ])
} else {
  (config.plugins).concat([])
}

module.exports = config
