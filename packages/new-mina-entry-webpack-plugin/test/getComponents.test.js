const test = require('ava')
const { resolve } = require('path')
const getComponents = require('../src/getComponents')

test('get components', t => {
  const context = resolve(__dirname, 'fixtures')
  const components = getComponents(context, 'pages/page')
  t.deepEqual(components, [
    "components/a",
    "components/b",
    "pages/components/c",
    "components/d"
  ])
})
