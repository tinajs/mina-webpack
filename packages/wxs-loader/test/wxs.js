import { resolve } from 'path'
import test from 'ava'
import compiler from './helpers/compiler'

const noop = () => {}

const macros = {
  async webpack(t, config = noop, test = noop) {
    const { compile, mfs } = compiler(config)
    const stats = await compile()

    t.is(stats.compilation.errors.length, 0, stats.compilation.errors)

    t.snapshot(mfs)

    test(t, mfs)
  },
}

test(
  'require',
  macros.webpack,
  config => {
    config.entry('entry').add('./fixtures/pokemon/eevee.wxs')
  },
  (t, mfs) => {
    t.true(mfs.existsSync('/assets/eevee.767a51.wxs', 'utf8'))
    t.true(mfs.existsSync('/assets/constants.39caca.wxs', 'utf8'))
    t.true(mfs.existsSync('/assets/greet.e4c88c.wxs', 'utf8'))

    t.is(
      mfs.readFileSync('/assets/eevee.767a51.wxs', 'utf8'),
      'const constants = require("./constants.39caca.wxs");\n\nconst greet = require("./greet.e4c88c.wxs");\n\nmodule.exports = greet(constants.EEVEE);'
    )

    t.pass()
  }
)

test(
  'default options',
  macros.webpack,
  config => {
    config.entry('entry').add('./fixtures/pokemon/eevee.wxs')
    config.module
      .rule('wxs')
      .use('wxs')
      .options()
  },
  (t, mfs) => {
    t.true(mfs.existsSync('/f3316048fe61f33a4f884ffc07e9e8eb.wxs', 'utf8'))
    t.true(mfs.existsSync('/39caca0fd21f51bcb712120d36ae59b3.wxs', 'utf8'))
    t.true(mfs.existsSync('/e4c88c228f3f9a32551be1979d11a078.wxs', 'utf8'))

    t.is(
      mfs.readFileSync('/f3316048fe61f33a4f884ffc07e9e8eb.wxs', 'utf8'),
      'const constants = require("./39caca0fd21f51bcb712120d36ae59b3.wxs");\n\nconst greet = require("./e4c88c228f3f9a32551be1979d11a078.wxs");\n\nmodule.exports = greet(constants.EEVEE);'
    )

    t.pass()
  }
)

test(
  'custom options: name, regExp',
  macros.webpack,
  config => {
    config.entry('entry').add('./fixtures/pokemon/eevee.wxs')
    config.module
      .rule('wxs')
      .use('wxs')
      .options({
        name: '[1]/[path]/[name].[hash:6].[ext]',
        regExp: /\.(\w+)$/,
      })
  },
  (t, mfs) => {
    t.true(mfs.existsSync('/wxs/fixtures/pokemon/eevee.347ed5.wxs', 'utf8'))
    t.true(mfs.existsSync('/wxs/fixtures/constants.39caca.wxs', 'utf8'))
    t.true(mfs.existsSync('/wxs/fixtures/greet.e4c88c.wxs', 'utf8'))

    t.is(
      mfs.readFileSync('/wxs/fixtures/pokemon/eevee.347ed5.wxs', 'utf8'),
      'const constants = require("./../constants.39caca.wxs");\n\nconst greet = require("./../greet.e4c88c.wxs");\n\nmodule.exports = greet(constants.EEVEE);'
    )

    t.pass()
  }
)

test(
  'custom options: name, regExp, context',
  macros.webpack,
  config => {
    config.entry('entry').add('./fixtures/pokemon/eevee.wxs')
    config.module
      .rule('wxs')
      .use('wxs')
      .options({
        name: '[1]/[path]/[name].[hash:6].[ext]',
        regExp: /\.(\w+)$/,
        context: resolve(__dirname, './fixtures/'),
      })
  },
  (t, mfs) => {
    t.true(mfs.existsSync('/wxs/pokemon/eevee.347ed5.wxs', 'utf8'))
    t.true(mfs.existsSync('/wxs/constants.39caca.wxs', 'utf8'))
    t.true(mfs.existsSync('/wxs/greet.e4c88c.wxs', 'utf8'))

    t.is(
      mfs.readFileSync('/wxs/pokemon/eevee.347ed5.wxs', 'utf8'),
      'const constants = require("./../constants.39caca.wxs");\n\nconst greet = require("./../greet.e4c88c.wxs");\n\nmodule.exports = greet(constants.EEVEE);'
    )

    t.pass()
  }
)
