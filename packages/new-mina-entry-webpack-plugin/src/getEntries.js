/* 从rootContext获取entries
 * 
 */

const addComponents = require('./addComponents')
const getPages = require('./getPages')

function getEntries (rootContext) {
  const pages = getPages(rootContext)
  const components = getComponents(rootContext, pages)

  const entries = { 'app': './app.mina' }
  const assets = []
  addEntries(entries, assets, components)

  return [entries, assets.sort()]
}

function getComponents (rootContext, pages) {
  const components = {}
  for (const page of pages) {
    addComponents(rootContext, page, components)
  }
  return components
}

function addEntries (entries, assets, components) {
  for (const name in components) {
    const component = components[name]
    let entryName, requestName
    if (component.isModule) {
      entryName = `_/_node_modules_/${name}`
      requestName = name
    } else {
      entryName = name
      requestName = './' + name
    }
    entries[entryName] = requestName + component.main
    for (const assetExtension of component.assets) {
      assets.push(requestName + assetExtension)
    }
  }
}

module.exports = getEntries
module.exports.addComponents = addComponents
