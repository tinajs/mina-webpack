/* 从rootContext获取entries
 * 
 */

const { relative } = require('path')
const addComponents = require('./addComponents')
const getPages = require('./getPages')

function getEntries (rootContext) {
  const pages = getPages(rootContext)
  const componentsMapping = getComponentsMapping(rootContext, pages)

  const entries = { 'app.js': './app.mina' }
  const assets = []
  addEntries(rootContext, componentsMapping, entries, assets)

  return [entries, assets.sort()]
}

function getComponentsMapping (rootContext, pages) {
  const components = {}
  for (const page of pages) {
    addComponents(rootContext, page, components)
  }
  return components
}

function addEntries (rootContext, componentsMapping, entries, assets) {
  for (const fullPath in componentsMapping) {
    const component = componentsMapping[fullPath]
    let entryName = getEntryName(rootContext, component)
    entries[entryName] = component.request
    for (const assetPath of component.assets) {
      assets.push(getAssetRequest(rootContext, assetPath))
    }
  }
}

function getEntryName (rootContext, component) {
  return relative(rootContext, component.fullPath)
    .replace(/^(\.\.\/)+/, matched => matched.replace(/\.\./g, '_'))
    .replace(/\.mina$/, '.js')
    .replace(/(^|\/)node_modules($|\/)/g, matched => matched.replace(/node_modules/, '_node_modules_'))
}

function getAssetRequest (rootContext, assetPath) {
  const relativePath = relative(rootContext, assetPath)
  if (relativePath.startsWith('../')) {
    return relativePath
  } else {
    return './' + relativePath
  }
}

module.exports = getEntries
