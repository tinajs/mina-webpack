const test = require('ava')
const { resolve } = require('path')
const readConfig = require('../src/readConfig')

test('read config from mina file', t => {
  const page1Path = resolve(__dirname, 'fixtures/pages/page1/page1.mina')
  const config = readConfig(page1Path)
  t.deepEqual(config, {
    "usingComponents": {
      "a": "/components/a/a",
      "b": "../../components/b/b",
      "c": "./c",
      "d": "/components/d/d"
    }
  })
})

test('read config from json path', t => {
  const page2Path = resolve(__dirname, 'fixtures/pages/page2/page2.json')
  const config = readConfig(page2Path)
  t.deepEqual(config, {
    "usingComponents": {
      "a": "/components/a/a",
      "b": "../../components/b/b",
      "c": "./c",
      "d": "/components/d/d"
    }
  })
})
