import path from 'path'
import test from 'ava'
import MinaRuntimePlugin from '@tinajs/mina-runtime-webpack-plugin'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

test('use MinaRuntimePlugin', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/basic'),
    entry: {
      'app.js': './app.mina',
      'page.js': './page.mina',
    },
    output: {
      filename: '[name]',
      globalObject: 'wx',
    },
    plugins: [new MinaRuntimePlugin()],
    optimization: {
      splitChunks: {
        chunks: 'all',
        name: 'common.js',
        minChunks: 2,
        minSize: 0,
      },
      runtimeChunk: {
        name: 'runtime.js',
      },
    },
  })

  await compile()

  const expectedStartsWith = `;require('runtime.js');require('common.js');(wx["webpackJsonp"] = wx["webpackJsonp"] || []).push(`
  const expectedRuntimeIncludes = `polyfill('parseInt', parseInt)`

  t.true(mfs.existsSync('/runtime.js'))
  t.true(
    mfs.readFileSync('/runtime.js', 'utf8').includes(expectedRuntimeIncludes)
  )
  t.true(mfs.existsSync('/common.js'))
  t.true(
    mfs.readFileSync('/common.js', 'utf8').includes("console.log('\\u2665')")
  )
  t.true(
    mfs
      .readFileSync('/common.js', 'utf8')
      .includes("console.log('\\ud83d\\udc95')")
  )

  t.true(mfs.readFileSync('/app.js', 'utf8').startsWith(expectedStartsWith))
  t.true(mfs.readFileSync('/page.js', 'utf8').startsWith(expectedStartsWith))
  t.true(mfs.readFileSync('/app.js', 'utf8').includes('Hello from App!'))
  t.true(mfs.readFileSync('/page.js', 'utf8').includes('Hello from Page!'))
  t.false(
    mfs.readFileSync('/app.js', 'utf8').includes("console.log('\\u2665')")
  )
  t.false(
    mfs
      .readFileSync('/app.js', 'utf8')
      .includes("console.log('\\ud83d\\udc95')")
  )
  t.false(
    mfs.readFileSync('/page.js', 'utf8').includes("console.log('\\u2665')")
  )
  t.false(
    mfs
      .readFileSync('/page.js', 'utf8')
      .includes("console.log('\\ud83d\\udc95')")
  )

  t.pass()
})
