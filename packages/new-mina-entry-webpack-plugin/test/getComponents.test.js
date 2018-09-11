const test = require('ava')
const { resolve } = require('path')
const getComponents = require('../src/getComponents')

const rootContext = resolve(__dirname, 'fixtures')

test('get components from mina file', t => {
  const configPath = resolve(__dirname, 'fixtures/pages/page1/page1.mina')
  const currentContext = resolve(__dirname, 'fixtures/pages/page1')
  const components = getComponents(rootContext, currentContext, configPath)
  t.deepEqual(components.map(component => component.request), [
    "./components/a/a.mina",
    "./components/b/b.js",
    "./pages/page1/c.mina"
  ])
})

test('get components from json file', t => {
  const configPath = resolve(__dirname, 'fixtures/pages/page2/page2.json')
  const currentContext = resolve(__dirname, 'fixtures/pages/page2')
  const components = getComponents(rootContext, currentContext, configPath)
  t.deepEqual(components.map(component => component.request), [
    "./components/a/a.mina",
    "./components/b/b.js",
    "./pages/page2/c.mina"
  ])
})
