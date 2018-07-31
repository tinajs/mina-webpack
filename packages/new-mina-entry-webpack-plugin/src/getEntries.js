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
    const extensions = components[name]
    if (extensions === '.mina') {
      addMinaEntry(entries, name)
    } else {
      addMultiEntry(entries, assets, name, extensions)
    }
  }
}

function addMinaEntry (entries, componentName) {
  entries[componentName] = './' + componentName + '.mina'
}

function addMultiEntry (entries, assets, componentName, componentExtensions) {
  let otherExtensions = componentExtensions.slice()
  let jsExtensionIndex = componentExtensions.indexOf('.js')
  if (jsExtensionIndex !== -1) {
    entries[componentName] = './' + componentName + '.js'
    otherExtensions.splice(jsExtensionIndex, 1)
  }
  for (const extension of otherExtensions) {
    assets.push('./' + componentName + extension)
  }
}

module.exports = getEntries
module.exports.addComponents = addComponents
