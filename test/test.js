import test from 'ava'
import compiler from './helpers/compiler'
import mfs from './helpers/mfs'

test('Inserts name and outputs JavaScript', async (t) => {
  const stats = await compiler('fixtures/basic.mina')
  const output = stats.toJson().modules[0].source

  t.is(await mfs.readFileSync('/fixtures/basic.wxs', 'utf8'), '\nexport default {\n  data () {\n    return {\n      msg: \'Hello from Component A!\'\n    }\n  }\n}\n')
  t.is(await mfs.readFileSync('/fixtures/basic.wxml', 'utf8'), '\n<h2 class="red">{{msg}}</h2>\n')
  t.is(await mfs.readFileSync('/fixtures/basic.wxss', 'utf8'), '\ncomp-a h2 {\n  color: #f00;\n}\n')
  t.is(await mfs.readFileSync('/fixtures/basic.json', 'utf8'), '\n{\n  "name": "mina"\n}\n')

  t.is(output, '')
  t.pass()
})
