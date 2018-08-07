const test = require('ava')
const { resolve, extname, relative } = require('path')
const resolveComponent = require('../src/resolveComponent')
const addComponents = require('../src/addComponents')

// TODO: map object
const addComponentsHelper = function (rootContext, currentContext) {
  const components = addComponents(rootContext, currentContext, {})
  const simplyfiedComponents = {}
  for (const fullPath in components) {
    const component = components[fullPath]
    const main = extname(component.fullPath)
    const assets = component.assets.map(assetPath => extname(assetPath))
    const request = relative(rootContext, fullPath)
    simplyfiedComponents[request] = [main].concat(assets)
  }
  return simplyfiedComponents
}

test('add components from mina entry', t => {
  const rootContext = resolve(__dirname, 'fixtures')
  const entryComponent = resolveComponent(rootContext, 'pages/page1/page1')
  t.deepEqual(addComponentsHelper(rootContext, entryComponent, {}), {
    "pages/page1/page1.mina": ['.mina'],
    "components/a/a.mina": ['.mina'],
    "components/b/b.js": ['.js', '.json', '.wxml'],
    "pages/page1/c.mina": ['.mina'],
    "components/e/e.js": ['.js'],
    "../vendor/local-component-one/index.mina": ['.mina'],
    "../vendor/local-component-two/index.js": ['.js', '.json', '.wxml']
  })
})

test('add components from json entry', t => {
  const context = resolve(__dirname, 'fixtures')
  const entryComponent = resolveComponent(context, 'pages/page2/page2')
  t.deepEqual(addComponentsHelper(context, entryComponent, {}), {
    "pages/page2/page2.js": ['.js', '.json'],
    "components/a/a.mina": ['.mina'],
    "components/b/b.js": ['.js', '.json', '.wxml'],
    "pages/page2/c.mina": ['.mina'],
    "components/e/e.js": ['.js']
  })
})

test('add module components', t => {
  const context = resolve(__dirname, 'fixtures')
  const entryComponent = resolveComponent(context, 'pages/page4/page4')
  t.deepEqual(addComponentsHelper(context, entryComponent, {}), {
    "pages/page4/page4.mina": ['.mina'],
    "components/a/a.mina": ['.mina'],
    "local-component-one/index.js": ['.js'],
  })
})
