const test = require('ava')
const { resolve } = require('path')
const addComponents = require('../src/addComponents')

test('add components from single entry', t => {
  const components = {}
  const context = resolve(__dirname, 'fixtures')
  addComponents(context, 'pages/page1/page1', components)
  t.deepEqual(components, {
    "pages/page1/page1": '.mina',
    "components/a/a": '.mina',
    "components/b/b": ['.js', '.json', '.wxml'],
    "pages/page1/components/c/c": [],
    "components/d/d": []
  })
})
