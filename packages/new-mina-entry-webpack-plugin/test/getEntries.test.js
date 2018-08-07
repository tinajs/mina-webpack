const test = require('ava')
const { resolve } = require('path')
const getEntries = require('../src/getEntries')

test('get entries', t => {
  const context = resolve(__dirname, 'fixtures')
  const [entries, assets] = getEntries(context)
  t.deepEqual(entries, {
    'app.js': './app.mina',
    'pages/page1/page1.js': './pages/page1/page1.mina',
    'pages/page2/page2.js': './pages/page2/page2.js',
    'pages/page3/page3.js': './pages/page3/page3.js',
    'components/a/a.js': './components/a/a.mina',
    'components/b/b.js': './components/b/b.js',
    'components/e/e.js': './components/e/e.js',
    'pages/page1/c.js': './pages/page1/c.mina',
    'pages/page2/c.js': './pages/page2/c.mina',
    '_/vendor/local-component-one/index.js': 'local-component-one/index.mina',
    '_/vendor/local-component-two/index.js': 'local-component-two/index.js'
  })
  t.deepEqual(assets, [
    '../vendor/local-component-two/index.json',
    '../vendor/local-component-two/index.wxml',
    './components/b/b.json',
    './components/b/b.wxml',
    './pages/page2/page2.json'
  ])
})
