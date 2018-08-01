const test = require('ava')
const { resolve } = require('path')
const resolveComponent = require('../src/resolveComponent')
const addComponents = require('../src/addComponents')

// TODO: map object
const addComponentsHelper = function (context, entryComponent) {
  const components = addComponents(context, entryComponent, {})
  const simplyfiedComponents = {}
  for (const request in components) {
    const component = components[request]
    simplyfiedComponents[request] = [component.main].concat(component.assets)
  }
  return simplyfiedComponents
}

test('add components from mina entry', t => {
  const context = resolve(__dirname, 'fixtures')
  const entryComponent = resolveComponent(context, 'pages/page1/page1')
  t.deepEqual(addComponentsHelper(context, entryComponent, {}), {
    "./pages/page1/page1": ['.mina'],
    "./components/a/a": ['.mina'],
    "./components/b/b": ['.js', '.json', '.wxml'],
    "./pages/page1/c": ['.mina'],
    "./components/e/e": ['.js'],
    "local-component-one/index": ['.mina'],
    "local-component-two/index": ['.js', '.json', '.wxml']
  })
})

test('add components from json entry', t => {
  const context = resolve(__dirname, 'fixtures')
  const entryComponent = resolveComponent(context, 'pages/page2/page2')
  t.deepEqual(addComponentsHelper(context, entryComponent, {}), {
    "./pages/page2/page2": ['.js', '.json'],
    "./components/a/a": ['.mina'],
    "./components/b/b": ['.js', '.json', '.wxml'],
    "./pages/page2/c": ['.mina'],
    "./components/e/e": ['.js']
  })
})

test('add module components', t => {
  const context = resolve(__dirname, 'fixtures')
  const entryComponent = resolveComponent(context, 'pages/page4/page4')
  t.deepEqual(addComponentsHelper(context, entryComponent, {}), {
    "./pages/page4/page4": ['.mina'],
    "./components/a/a": ['.mina'],
    "local-component-one/index": ['.mina'],
    "./local-component-one/index": ['.js'],
  })
})
