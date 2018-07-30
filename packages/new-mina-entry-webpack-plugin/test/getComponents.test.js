const test = require('ava')
const { resolve } = require('path')
const getComponents = require('../src/getComponents')

test('get components from mina file', t => {
  const context = resolve(__dirname, 'fixtures')
  const components = getComponents(context, 'pages/page1/page1')
  t.deepEqual(components, [
    "components/a",
    "components/b",
    "pages/page1/components/c",
    "components/d"
  ])
})

test('get components from json file', t => {
  const context = resolve(__dirname, 'fixtures')
  const components = getComponents(context, 'pages/page2/page2')
  t.deepEqual(components, [
    "components/a",
    "components/b",
    "pages/page2/components/c",
    "components/d"
  ])
})
