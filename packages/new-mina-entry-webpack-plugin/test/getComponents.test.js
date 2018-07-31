const test = require('ava')
const { resolve } = require('path')
const getComponents = require('../src/getComponents')

const context = resolve(__dirname, 'fixtures')

test('get components from mina file', t => {
  const configPath = resolve(__dirname, 'fixtures/pages/page1/page1.mina')
  const components = getComponents(context, 'pages/page1/page1', configPath)
  t.deepEqual(components.map(component => component.name), [
    "components/a/a",
    "components/b/b",
    "pages/page1/c"
  ])
})

test('get components from json file', t => {
  const configPath = resolve(__dirname, 'fixtures/pages/page2/page2.json')
  const components = getComponents(context, 'pages/page2/page2', configPath)
  t.deepEqual(components.map(component => component.name), [
    "components/a/a",
    "components/b/b",
    "pages/page2/c"
  ])
})
