const test = require('ava')
const { resolve } = require('path')
const getEntries = require('../src/getEntries')

test('get entries', t => {
  const context = resolve(__dirname, 'fixtures')
  const [entries, assets] = getEntries(context)
  t.deepEqual(entries, {
    'app': './app.mina',
    'pages/page1/page1': './pages/page1/page1.mina',
    'pages/page2/page2': './pages/page2/page2.js',
    'pages/page3/page3': './pages/page3/page3.js',
    'components/a/a': './components/a/a.mina',
    'components/b/b': './components/b/b.js',
    'components/e/e': './components/e/e.js',
    'pages/page1/c': './pages/page1/c.mina',
    'pages/page2/c': './pages/page2/c.mina',
    '_/_/vendor/local-component-one/index': 'local-component-one/index.mina',
    '_/_/vendor/local-component-two/index': 'local-component-two/index.js'
  })
  t.deepEqual(assets, [
    './components/b/b.json',
    './components/b/b.wxml',
    './pages/page2/page2.json',
    'local-component-two/index.json',
    'local-component-two/index.wxml'
  ])
})
