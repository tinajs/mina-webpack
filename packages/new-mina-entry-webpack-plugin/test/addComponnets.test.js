const test = require('ava')
const { resolve } = require('path')
const resolveComponent = require('../src/resolveComponent')
const addComponents = require('../src/addComponents')

test('add components from mina entry', t => {
  const context = resolve(__dirname, 'fixtures')
  const entryComponent = resolveComponent(context, 'pages/page1/page1')
  t.deepEqual(addComponents(context, entryComponent, {}), {
    "pages/page1/page1": '.mina',
    "components/a/a": '.mina',
    "components/b/b": ['.js', '.json', '.wxml'],
    "pages/page1/c": '.mina',
    "components/e/e": ['.js']
  })
})

test('add components from json entry', t => {
  const context = resolve(__dirname, 'fixtures')
  const entryComponent = resolveComponent(context, 'pages/page2/page2')
  t.deepEqual(addComponents(context, entryComponent, {}), {
    "pages/page2/page2": ['.js', '.json'],
    "components/a/a": '.mina',
    "components/b/b": ['.js', '.json', '.wxml'],
    "pages/page2/c": '.mina',
    "components/e/e": ['.js']
  })
})
