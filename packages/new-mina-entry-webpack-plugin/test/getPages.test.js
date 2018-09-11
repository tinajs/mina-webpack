const test = require('ava')
const { resolve } = require('path')
const getPages = require('../src/getPages')

test('get pages', t => {
  const context = resolve(__dirname, 'fixtures')
  const pages = getPages(context)
  t.deepEqual(pages.map(page => page.request), [
    './pages/page1/page1.mina',
    './pages/page2/page2.js',
    './pages/page3/page3.js'
  ])
})
