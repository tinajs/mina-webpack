import test from 'ava'
import compiler from './helpers/compiler'

test('require', async t => {
  const { compile, mfs } = compiler(config => {
    config.entry('entry').add('./fixtures/pokemon/eevee.wxs')
  })
  const stats = await compile()

  t.is(stats.compilation.errors.length, 0, stats.compilation.errors)

  t.snapshot(mfs)

  t.true(mfs.existsSync('/assets/eevee.767a51.wxs', 'utf8'))
  t.true(mfs.existsSync('/assets/constants.39caca.wxs', 'utf8'))
  t.true(mfs.existsSync('/assets/greet.e4c88c.wxs', 'utf8'))

  t.is(
    mfs.readFileSync('/assets/eevee.767a51.wxs', 'utf8'),
    'const constants = require("./constants.39caca.wxs");\n\nconst greet = require("./greet.e4c88c.wxs");\n\nmodule.exports = greet(constants.EEVEE);'
  )

  t.pass()
})
