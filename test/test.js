import test from 'ava'
import compiler from './helpers/compiler'
import mfs from './helpers/mfs'

test('Inserts name and outputs JavaScript', async (t) => {
  try {
    const stats = await compiler('fixtures/basic.mina')
    const output = stats.toJson().modules[0].source

    // console.log(mfs.data)

    t.is(mfs.readFileSync('/fixtures/basic.wxs', 'utf8'), '\nexport default {\n  data () {\n    return {\n      msg: \'Hello from Component A!\'\n    }\n  }\n}\n')
    t.is(mfs.readFileSync('/fixtures/basic.wxml', 'utf8'), '\n<div>\n  <h2 class="red">{{msg}}</h2>\n  <img src="logo.7bd732.png" />\n</div>\n')
    t.is(mfs.readFileSync('/fixtures/basic.wxss', 'utf8'), '\ncomp-a h2 {\n  color: #f00;\n  background: url(logo.7bd732.png);\n}\n')
    t.is(mfs.readFileSync('/fixtures/basic.json', 'utf8'), '\n{\n  "name": "mina"\n}\n')
    t.true(mfs.existsSync('/logo.7bd732.png'))

    // t.is(output, '')
    t.pass()
  } catch (error) {
    console.log(error)
  }
})
