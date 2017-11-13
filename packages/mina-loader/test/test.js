import test from 'ava'
import { expect } from 'chai'
import compiler from './helpers/compiler'
import mfs from './helpers/mfs'

test('Inserts name and outputs JavaScript', async (t) => {
  try {
    const stats = await compiler('fixtures/basic.mina')

    // console.log(mfs.readFileSync('/fixtures/basic.js', 'utf8'))
    console.log(mfs.data)

    t.true(mfs.readFileSync('/fixtures/basic.js', 'utf8').includes('Hello from Component A!'))
    t.true(mfs.readFileSync('/fixtures/basic.js', 'utf8').includes('console.log(\'\\u2665\')'))
    t.is(mfs.readFileSync('/fixtures/basic.wxml', 'utf8'), '\n<div>\n  <h2 class="red">{{msg}}</h2>\n  <img src="assets/logo.7bd732.png" />\n</div>\n')
    t.is(mfs.readFileSync('/fixtures/basic.wxss', 'utf8'), '\ncomp-a h2 {\n  color: #f00;\n  background: url(assets/logo.7bd732.png);\n}\n')
    t.is(mfs.readFileSync('/fixtures/basic.json', 'utf8'), '\n{\n  "name": "mina"\n}\n')
    t.true(mfs.existsSync('/assets/logo.7bd732.png'))

    t.pass()
  } catch (error) {
    console.log(error)
  }
})
