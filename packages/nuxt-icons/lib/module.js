
const path = require('path')

const defaults = {
  iconsDir: 'assets/icons/',
  loadPaths: [],
  ssr: false
}

module.exports = function icons (moduleOptions) {
  const options = Object.assign(defaults, this.options.icons, moduleOptions)

  // Register `plugin.js` template
  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: 'icons.js',
    ssr: options.ssr,
    options
  })

  // Add `html-loader` to load svgs
  this.extendBuild((config) => {
    // Exclude svg from url-loader
    const svgLoader = config.module.rules.find(rule => rule.test && String(rule.test).includes('svg'))

    if (svgLoader) {
      svgLoader.exclude = [
        path.resolve(__dirname, '../../../../', options.iconsDir)
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
