const test = require('ava')
const { resolve } = require('path')
const resolveComponent = require('../src/resolveComponent')

test('resolve single file component', t => {
  const context = resolve(__dirname, 'fixtures')
  const component = resolveComponent(context, 'pages/page1/page1')
  t.deepEqual(component, {
    name: 'pages/page1/page1',
    extensions: '.mina',
    configPath: resolve(context, 'pages/page1/page1.mina')
  })
})

test('resolve splited files component', t => {
  const context = resolve(__dirname, 'fixtures')
  const component = resolveComponent(context, 'pages/page2/page2')
  t.deepEqual(component, {
    name: 'pages/page2/page2',
    extensions: ['.js', '.json'],
    configPath: resolve(context, 'pages/page2/page2.json')
  })
})
