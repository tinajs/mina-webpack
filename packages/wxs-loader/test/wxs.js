import test from 'ava'
import compiler from './helpers/compiler'

test('require', async t => {
  const { compile, mfs } = compiler(config => {
    config.entry('entry').add('./fixtures/pokemon/eevee.wxs')
  })
  const stats = await compile()

  t.is(stats.compilation.errors.length, 0, stats.compilation.errors)

  t.is(
    mfs.readFileSync('/assets/eevee.2f7f17.wxs', 'utf8'),
    'const constants = require("/assets/constants.8d11a1.wxs");\n\nconst greet = require("/assets/greet.e4c88c.wxs");\n\nmodule.exports = greet(constants.EEVEE);'
  )

  t.true(mfs.existsSync('/assets/constants.8d11a1.wxs', 'utf8'))
  t.true(mfs.existsSync('/assets/greet.e4c88c.wxs', 'utf8'))

  t.pass()
})

test('import', async t => {
  const { compile, mfs } = compiler(config => {
    config.entry('entry').add('./fixtures/pokemon/pikachu.wxs')
  })
  const stats = await compile()

  t.is(stats.compilation.errors.length, 0, stats.compilation.errors)

  t.is(
    mfs.readFileSync('/assets/pikachu.f4526b.wxs', 'utf8'),
    'import constants from "/assets/constants.8d11a1.wxs";\nimport greet from "/assets/greet.e4c88c.wxs";\nmodule.exports = greet(constants.PIKACHU);'
  )

  t.true(mfs.existsSync('/assets/constants.8d11a1.wxs', 'utf8'))
  t.true(mfs.existsSync('/assets/greet.e4c88c.wxs', 'utf8'))

  t.pass()
})
