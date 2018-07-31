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
  for (const request in components) {
    const component = components[request]
    let entryName = component.isModule 
      ? '_/__node_modules__/' + component.name 
      : component.name
    entries[entryName] = request + component.main
    for (const assetExtension of component.assets) {
      assets.push(request + assetExtension)
    }
  }
}

module.exports = getEntries
