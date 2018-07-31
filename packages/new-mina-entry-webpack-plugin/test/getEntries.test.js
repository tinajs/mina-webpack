const test = require('ava')
const { resolve } = require('path')
const getEntries = require('../src/getEntries')

test('get entries', t => {
  const context = resolve(__dirname, 'fixtures')
  const [entries, assets] = getEntries(context)
  t.deepEqual(entries, {
    'app': './app.mina',
    'pages/page1/page1': './pages/page1/page1.mina',
    'components/a/a': './components/a/a.mina',
    'components/b/b': './components/b/b.js',
    'components/e/e': './components/e/e.js',
    'pages/page2/page2': './pages/page2/page2.js',
    'pages/page3/page3': './pages/page3/page3.js'
  })
  t.deepEqual(assets, [
    './components/b/b.json',
    './components/b/b.wxml',
    './pages/page2/page2.json'
  ])
})
