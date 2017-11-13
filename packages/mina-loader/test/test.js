import test from 'ava'
import { expect } from 'chai'
import compiler from './helpers/compiler'
import mfs from './helpers/mfs'

test('Inserts name and outputs JavaScript', async (t) => {
  try {
    const stats = await compiler('fixtures/page.mina')

    // console.log(mfs.readFileSync('/fixtures/page.js', 'utf8'))
    console.log(mfs.data)

    t.true(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('Hello from Page!'))
    t.true(mfs.readFileSync('/fixtures/page.js', 'utf8').includes('console.log(\'\\u2665\')'))
    t.is(mfs.readFileSync('/fixtures/page.wxml', 'utf8'), '\n<view>\n  <text class="red">{{msg}}</text>\n  <image src="assets/logo.7bd732.png" />\n</view>\n')
    t.is(mfs.readFileSync('/fixtures/page.wxss', 'utf8'), '\ntext {\n  color: #f00;\n  background: url(assets/logo.7bd732.png);\n}\n')
    t.is(mfs.readFileSync('/fixtures/page.json', 'utf8'), '\n{\n  "name": "mina"\n}\n')
    t.true(mfs.existsSync('/assets/logo.7bd732.png'))

    t.pass()
  } catch (error) {
    console.log(error)
  }
})
