import test from 'ava'
import compiler from './helpers/compiler'

test('use translations', async t => {
  const { compile, mfs } = compiler({
    entry: './fixtures/basic/page.mina',
    output: {
      filename: 'fixtures/basic/page.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
            options: {
              transform: require('./helpers/transform/scope-id'),
            },
          },
        },
      ],
    },
  })
  const stats = await compile()

  t.deepEqual(stats.compilation.errors, [], stats.compilation.errors[0])

  t.true(mfs.existsSync('/assets/logo.7bd732.png'))

  t.true(
    mfs
      .readFileSync('/fixtures/basic/page.js', 'utf8')
      .includes('module.exports = "a2fce32d"')
  )
  t.is(mfs.readFileSync('/fixtures/basic/page.wxml', 'utf8'), 'a2fce32d')
  t.is(mfs.readFileSync('/fixtures/basic/page.wxss', 'utf8'), 'a2fce32d')
  t.is(mfs.readFileSync('/fixtures/basic/page.json', 'utf8'), 'a2fce32d')

  t.pass()
})
