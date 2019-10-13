import path from 'path'
import test from 'ava'
import MinaEntryPlugin from '@tinajs/mina-entry-webpack-plugin'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

test('subpackages', async t => {
  const { compile, mfs } = compiler({
    context: resolveRelative('fixtures/subpackages/src'),
    entry: 'app.mina',
    output: {
      filename: 'app.js',
    },
    plugins: [new MinaEntryPlugin()],
  })

  await compile()
  // sub1
  t.deepEqual(JSON.parse(mfs.readFileSync('/sub1/page1.json', 'utf-8')), {
    usingComponents: {
      a: './_/components/a', // a is moved to sub1
      b: './../components/b', // b is shared from sub1, sub2, so it's not moved
    },
  })
  // sub2
  t.deepEqual(JSON.parse(mfs.readFileSync('/sub2/page1.json', 'utf-8')), {
    usingComponents: {
      b: './../components/b', // b is shared from sub1, sub2, so it's not moved
    },
  })
  // a is only used by sub1, it is moved
  t.deepEqual(
    JSON.parse(mfs.readFileSync('/sub1/_/components/a.json', 'utf-8')),
    {
      usingComponents: {
        c: './c', // c is also moved
        d: './../../../components/d', // d is not moved
      },
    }
  )
  // b is shared by sub1 and sub2, it is not moved
  t.deepEqual(JSON.parse(mfs.readFileSync('/components/b.json', 'utf-8')), {
    usingComponents: {
      d: './d', // d is not moved
    },
  })
  // c is only used by a, it is moved
  t.deepEqual(
    JSON.parse(mfs.readFileSync('/sub1/_/components/c.json', 'utf-8')),
    {
      component: true,
    }
  )
  // d is shared by a and b, it's not moved
  t.deepEqual(JSON.parse(mfs.readFileSync('/components/d.json', 'utf-8')), {
    component: true,
  })

  t.pass()
})
