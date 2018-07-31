const test = require('ava')
const { resolve } = require('path')
const addComponents = require('../src/addComponents')

test.only('add components from mina entry', t => {
  const components = {}
  const context = resolve(__dirname, 'fixtures')
  addComponents(context, 'pages/page1/page1', components)
  t.deepEqual(components, {
    "pages/page1/page1": '.mina',
    "components/a/a": '.mina',
    "components/b/b": ['.js', '.json', '.wxml'],
    "pages/page1/c": '.mina',
    "components/e/e": ['.js']
  })
})

test.only('add components from json entry', t => {
  const components = {}
  const context = resolve(__dirname, 'fixtures')
  addComponents(context, 'pages/page2/page2', components)
  t.deepEqual(components, {
    "pages/page2/page2": ['.js', '.json'],
    "components/a/a": '.mina',
    "components/b/b": ['.js', '.json', '.wxml'],
    "pages/page2/c": '.mina',
    "components/e/e": ['.js']
  })
})
