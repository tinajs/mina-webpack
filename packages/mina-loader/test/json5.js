import path from 'path'
import test from 'ava'
import { expect } from 'chai'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

function createCompiler({ minimize }) {
  return compiler({
    context: resolveRelative('fixtures/json5'),
    entry: './component.mina',
    output: {
      filename: 'component.js',
    },
    module: {
      rules: [
        {
          test: /\.mina$/,
          use: {
            loader: require.resolve('..'),
            options: {
              minimize,
              loaders: {
                script: 'babel-loader',
              },
            },
          },
        },
      ],
    },
  })
}

test('use json5 to parse config', async t => {
  const { compile, mfs } = createCompiler({ minimize: false })
  await compile()
  const got = JSON.parse(mfs.readFileSync('/component.json', 'utf-8'))
  const expected = {
    component: true,
  }
  t.deepEqual(got, expected)
  t.deepEqual(
    mfs.readFileSync('/component.json', 'utf-8'),
    JSON.stringify(expected, null, 2)
  )
  t.pass()
})

test('use json5 to parse config with minimize', async t => {
  const { compile, mfs } = createCompiler({ minimize: true })
  await compile()
  const got = JSON.parse(mfs.readFileSync('/component.json', 'utf-8'))
  const expected = {
    component: true,
  }
  t.deepEqual(got, expected)
  t.deepEqual(
    mfs.readFileSync('/component.json', 'utf-8'),
    JSON.stringify(expected)
  )
  t.pass()
})
