import path from 'path'
import test from 'ava'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

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
          test: /\.ts$/,
          use: {
            loader: 'ts-loader',
          },
        },
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
            options: {
              loaders: {
                script: {
                  loader: 'ts-loader',
                },
              },
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
            options: {
              loaders: {
                script: {
                  loader: 'babel-loader',
                  presets: [['env']],
                },
              },
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
