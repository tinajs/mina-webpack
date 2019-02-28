import path from 'path'
import test from 'ava'
import precss from 'precss'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

test('load separated source files', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/separation'),
    entry: './simple-page.mina',
    output: {
      filename: 'simple-page.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
          },
        },
        {
          test: /\.wxss$/,
          use: {
            loader: 'postcss-loader',
            options: {
              plugins: [precss],
            },
          },
        },
      ],
    },
  })

  const stats = await compile()

  t.deepEqual(stats.compilation.errors, [])

  t.is(
    mfs.readFileSync('/simple-page.wxml', 'utf8'),
    '<view>Page <image src="/assets/logo.7bd732.png" /></view>\n'
  )
  t.is(
    mfs.readFileSync('/simple-page.wxss', 'utf8'),
    '.view .image {\n    width: 0;\n  }\n'
  )

  t.pass()
})

test('load separated .ts source file', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/separation'),
    entry: './ts-page.mina',
    output: {
      filename: 'ts-page.js',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
          },
        },
        {
          test: /\.ts$/,
          use: {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.mina$/],
            },
          },
        },
      ],
    },
  })

  await compile()
  t.false(mfs.readFileSync('/ts-page.js', 'utf8').includes('onLoad () {'))
  t.true(
    mfs.readFileSync('/ts-page.js', 'utf8').includes('onLoad: function () {')
  )
  t.true(
    mfs.readFileSync('/ts-page.js', 'utf8').includes('Hello from TS Page!')
  )
  // TypeScript targeting ES5 should shim generator and await syntax
  t.true(mfs.readFileSync('/ts-page.js', 'utf8').includes('return __generator'))
  t.pass()
})

test('load separated .es source file', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/separation'),
    entry: './es-page.mina',
    output: {
      filename: 'es-page.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
          },
        },
        {
          test: /\.es$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env']],
            },
          },
        },
      ],
    },
  })

  await compile()
  t.false(mfs.readFileSync('/es-page.js', 'utf8').includes('onLoad () {'))
  t.true(
    mfs
      .readFileSync('/es-page.js', 'utf8')
      .includes('onLoad: function onLoad() {')
  )
  t.true(
    mfs.readFileSync('/es-page.js', 'utf8').includes('Hello from ES Page!')
  )
  t.pass()
})
