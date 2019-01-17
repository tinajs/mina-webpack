import test from 'ava'
import compiler from './helpers/compiler'

test('use translations', async t => {
  const scopeIdLoader = require.resolve('./helpers/loaders/scope-id-loader')
  const extractScopeIdLoader = `extract-loader!${scopeIdLoader}`

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
              translations: {
                config: extractScopeIdLoader,
                template: extractScopeIdLoader,
                script: scopeIdLoader,
                style: extractScopeIdLoader,
              },
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
      .includes('module.exports = "3d3b9153"')
  )
  t.is(mfs.readFileSync('/fixtures/basic/page.wxml', 'utf8'), '3d3b9153')
  t.is(mfs.readFileSync('/fixtures/basic/page.wxss', 'utf8'), '3d3b9153')
  t.is(mfs.readFileSync('/fixtures/basic/page.json', 'utf8'), '3d3b9153')

  t.pass()
})
