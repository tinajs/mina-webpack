import path from 'path'
import test from 'ava'
import rimraf from 'rimraf'
import compiler from './helpers/compiler'

const fixture = p => path.join(__dirname, 'fixtures', p)

test.afterEach(() => {
  return new Promise(resolve => {
    rimraf(fixture('enforceRelativePath/.dist'), () => resolve())
  })
})

test('enforceRelativePath: keep enforce', async t => {
  const { compile, mfs } = compiler({
    entry: './fixtures/enforce-relative-path/page.mina',
    output: {
      filename: 'fixtures/enforce-relative-path/page.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
            options: {
              enforceRelativePath: true,
            },
          },
        },
      ],
    },
  })

  const stats = await compile()

  t.is(
    mfs.readFileSync('/fixtures/enforce-relative-path/page.wxml', 'utf8'),
    [
      '<view>',
      '  <image src="../../assets/logo.72c9db.png" />',
      '  <image src="../../assets/logo.72c9db.png" />',
      '</view>',
    ].join('\n')
  )

  t.pass()
})

test('enforceRelativePath: use loose mode to allow absolute path', async t => {
  const { compile, mfs } = compiler({
    entry: './fixtures/enforce-relative-path/page.mina',
    output: {
      filename: 'fixtures/enforce-relative-path/page.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
            options: {
              enforceRelativePath: false,
            },
          },
        },
      ],
    },
  })

  const stats = await compile()

  t.is(
    mfs.readFileSync('/fixtures/enforce-relative-path/page.wxml', 'utf8'),
    [
      '<view>',
      '  <image src="/assets/logo.72c9db.png" />',
      '  <image src="/assets/logo.72c9db.png" />',
      '</view>',
    ].join('\n')
  )

  t.pass()
})
