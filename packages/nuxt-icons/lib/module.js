
const path = require('path')

module.exports = function icons () {
  // Register `plugin.js` template
  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: 'icons.js',
    ssr: false
  })

  // Add `html-loader` to load svgs
  this.extendBuild((config) => {
    // Exclude svg from url-loader
    const urlLoader = config.module.rules.find(rule => rule.use && rule.use.find(r => r.loader === 'url-loader'))
    if (urlLoader) {
      urlLoader.exclude = [
        path.resolve(__dirname, '../../../assets/icons/')
      ]
    }
    config.module.rules.push({
      test: /\.svg$/,
      loader: 'html-loader',
      options: {
        minimize: true
      },
      include: [
        path.resolve(__dirname, '../../../assets/icons/')
      ]
    })
  })
}

module.exports.meta = require('../package.json')
