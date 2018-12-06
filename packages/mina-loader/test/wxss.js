import fs from 'fs'
import path from 'path'
import test from 'ava'
import rimraf from 'rimraf'
import compiler from './helpers/compiler'

const fixture = p => path.join(__dirname, 'fixtures', p)

const logo =
  'image/png;base64,' +
  fs.readFileSync(fixture('basic/logo.png.txt'), 'utf8').trim()

test.afterEach(() => {
  return new Promise(resolve => {
    rimraf(fixture('wxss/.dist'), () => resolve())
  })
})

test('url in wxss should be encoded as base64 inlined url by default', async t => {
  const { compile, mfs } = compiler({
    entry: './fixtures/wxss/page.mina',
    output: {
      filename: 'fixtures/wxss/page.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
          },
        },
      ],
    },
  })

  const stats = await compile()

  t.is(
    mfs.readFileSync('/fixtures/wxss/page.wxss', 'utf8'),
    `text.blue {\n  color: #00f;\n  background: url(data:${logo});\n}`
  )

  t.pass()
})

test('url in wxss could be process with other inline url replacer', async t => {
  const { compile, mfs } = compiler({
    entry: './fixtures/wxss/page.mina',
    output: {
      filename: 'fixtures/wxss/page.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
            options: {
              loaders: {
                style: {
                  loader: 'postcss-loader',
                  options: {
                    config: {
                      path: path.resolve(__dirname, './fixtures/wxss/url/'),
                    },
                  },
                },
              },
            },
          },
        },
      ],
    },
  })

  const stats = await compile()

  t.is(
    mfs.readFileSync('/fixtures/wxss/page.wxss', 'utf8'),
    `text.blue {\n  color: #00f;\n  background: url(data:${logo});\n}`
  )

  t.pass()
})

test('url in wxss could be process with other loaders', async t => {
  const { compile, mfs } = compiler({
    entry: './fixtures/wxss/page.mina',
    output: {
      filename: 'fixtures/wxss/page.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
            options: {
              loaders: {
                style: {
                  loader: 'postcss-loader',
                  options: {
                    config: {
                      path: path.resolve(__dirname, './fixtures/wxss/cdn/'),
                    },
                  },
                },
              },
            },
          },
        },
      ],
    },
  })

  const stats = await compile()

  t.is(
    mfs.readFileSync('/fixtures/wxss/page.wxss', 'utf8'),
    `text.blue {\n  color: #00f;\n  background: url(https://cdn.url/logo_511d9d.png);\n}`
  )

  t.true(fs.existsSync(fixture('wxss/.dist/cdn/logo_511d9d.png')))

  t.pass()
})

test('disable base64 inlined by url in wxss ', async t => {
  const { compile, mfs } = compiler({
    entry: './fixtures/wxss/page.mina',
    output: {
      filename: 'fixtures/wxss/page.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
            options: {
              useWxssUrl: false,
            },
          },
        },
      ],
    },
  })

  const stats = await compile()

  t.is(
    mfs.readFileSync('/fixtures/wxss/page.wxss', 'utf8'),
    `text.blue {\n  color: #00f;\n  background: url(../basic/logo.png);\n}`
  )

  t.pass()
})
