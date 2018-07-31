/* 从rootContext获取entries
 * 
 */

const { resolve } = require('path')
const addComponents = require('./addComponents')
const getPages = require('./getPages')

function getEntries (rootContext) {
  const pageNames = getPages(resolve(rootContext, 'app.mina'))

  const components = {}
  for (const pageName of pageNames) {
    addComponents(rootContext, pageName, components)
  }

  const entries = { 'app': './app.mina' }
  const assets = []
  for (componentName in components) {
    const componentExtensions = components[componentName]
    if (componentExtensions === '.mina') {
      addMinaEntry(entries, componentName)
    } else {
      addMultiEntry(entries, assets, componentName, componentExtensions)
    }
  }

  return [entries, assets.sort()]
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
