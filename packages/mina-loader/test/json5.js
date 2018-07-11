import path from 'path'
import test from 'ava'
import { expect } from 'chai'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

test('use json5 to parse config', async t => {
  const { compile, mfs } = compiler({
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
              loaders: {
                script: 'babel-loader',
              },
            },
          },
        },
      ],
    },
  })

  await compile()
  t.deepEqual(JSON.parse(mfs.readFileSync('/component.json', 'utf-8')), {
    component: true,
  })
  t.pass()
})
