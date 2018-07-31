const test = require('ava')
const { resolve } = require('path')
const getPages = require('../src/getPages')

test('get pages', t => {
  const appPath = resolve(__dirname, 'fixtures/app.mina')
  const pages = getPages(appPath)
  t.deepEqual(pages,     [
  'pages/page1/page1',
  'pages/page2/page2',
  'pages/page3/page3',
  ])
})
