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
    entry: './fixtures/enforce-relative-path/enforce.mina',
    output: {
      filename: 'fixtures/enforce-relative-path/enforce.js',
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
    mfs.readFileSync('/fixtures/enforce-relative-path/enforce.wxml', 'utf8'),
    `<image src="../../assets/logo.7bd732.png" />`
  )

  t.pass()
})

test('enforceRelativePath: use loose mode to allow absolute path', async t => {
  const { compile, mfs } = compiler({
    entry: './fixtures/enforce-relative-path/loose.mina',
    output: {
      filename: 'fixtures/enforce-relative-path/loose.js',
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
    mfs.readFileSync('/fixtures/enforce-relative-path/loose.wxml', 'utf8'),
    ['<view>',
      '  <image src="../../assets/logo.7bd732.png" />',
      '  <image src="../../assets/logo.7bd732.png" />',
      '</view>'
    ].join('\n')
  )

  t.pass()
})
