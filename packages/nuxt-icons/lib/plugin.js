export default ({ store }, inject) => {

  function importIcons () {
    const context = require.context(<%= `'${options.iconsDir}'` %>, true, /\.svg$/)
    const icons = {}
  
    context.keys().forEach((key) => {
      // TODO - clean up regex
      let fileName = key.match(/[^/]+$/)
      fileName = fileName.toString().replace(/\.[^/.]+$/, '')
      icons[fileName] = context(key)
    })
  
    return icons
  }  

  inject('icons', importIcons())
}
