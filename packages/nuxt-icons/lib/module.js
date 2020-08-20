
const path = require('path')

const defaults = {
  iconsDir: 'assets/icons/',
  loadPaths: []
}

module.exports = function icons (moduleOptions) {
  const options = Object.assign(defaults, this.options.icons, moduleOptions)

  // Register `plugin.js` template
  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: 'icons.js',
    ssr: false,
    options
  })

  // Add `html-loader` to load svgs
  this.extendBuild((config) => {
    // Exclude svg from url-loader
    const urlLoader = config.module.rules.find(rule => rule.use && rule.use.find(r => r.loader === 'url-loader'))
    if (urlLoader) {
      urlLoader.exclude = [
        path.resolve(__dirname, '../../../../', options.iconsDir),
        ...options.loadPaths.map(p => path.resolve(__dirname, '../../../../', p))
      ]
    }
    config.module.rules.push({
      test: /\.svg$/,
      loader: 'html-loader',
      options: {
        minimize: true
      },
      include:  [
        path.resolve(__dirname, '../../../../', options.iconsDir),
        ...options.loadPaths.map(p => path.resolve(__dirname, '../../../../', p))
      ]
    })
  })
}

module.exports.meta = require('../package.json')
