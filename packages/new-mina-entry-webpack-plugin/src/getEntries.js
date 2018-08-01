/* 从rootContext获取entries
 * 
 */

const { relative } = require('path')
const addComponents = require('./addComponents')
const getPages = require('./getPages')

function getEntries (rootContext) {
  const pages = getPages(rootContext)
  const componentsMapping = getComponentsMapping(rootContext, pages)

  const entries = { 'app': './app.mina' }
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
  for (const request in componentsMapping) {
    const component = componentsMapping[request]
    let entryName = getEntryName(rootContext, component)
    entries[entryName] = request + component.main
    for (const assetExtension of component.assets) {
      assets.push(request + assetExtension)
    }
  }
}

function getEntryName (rootContext, component) {
  return relative(rootContext, component.fullPath).replace(/^(\.\.\/)+/, matched => 
    matched.replace(/\.\./g, '_')
  )
}

module.exports = getEntries
