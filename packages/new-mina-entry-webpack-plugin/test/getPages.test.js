const test = require('ava')
const { resolve } = require('path')
const getPages = require('../src/getPages')

test('get pages', t => {
  const appPath = resolve(__dirname, 'fixtures/app.mina')
  const pages = getPages(appPath)
  t.deepEqual(pages, ['a', 'b', 'c'])
})
