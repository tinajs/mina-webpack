import path from 'path'
import test from 'ava'
import { expect } from 'chai'
import compiler from './helpers/compiler'

const resolveRelative = path.resolve.bind(null, __dirname)

test('inline template', async t => {
  try {
    const { compile, mfs } = compiler({
      entry: './fixtures/template/inline.mina',
      output: {
        filename: 'fixtures/template/inline.js',
      },
    })
    const stats = await compile()

    t.true(
      mfs
        .readFileSync('/fixtures/template/inline.js', 'utf8')
        .includes('loaded')
    )
    t.is(
      mfs.readFileSync('/fixtures/template/inline.wxml', 'utf8'),
      '<view>\n  <template name="odd">\n    <view> odd </view>\n  </template>\n  <template name="even">\n    <view> even </view>\n  </template>\n  <block wx:for="{{[1, 2, 3, 4, 5]}}">\n    <template is="{{item % 2 == 0 ? \'even\' : \'odd\'}}"/>\n  </block>\n</view>'
    )
    t.is(
      mfs.readFileSync('/fixtures/template/inline.wxss', 'utf8'),
      'view {\n  color: #00f;\n}'
    )
    t.is(
      mfs.readFileSync('/fixtures/template/inline.json', 'utf8'),
      '{\n  "name": "mina"\n}'
    )

    t.pass()
  } catch (error) {
    console.log(error)
  }
})

test('import template', async t => {
  try {
    const { compile, mfs } = compiler({
      entry: './fixtures/template/import.mina',
      output: {
        filename: 'fixtures/template/import.js',
      },
    })
    const stats = await compile()

    t.is(
      mfs.readFileSync('/wxml/message.fd0e28.wxml', 'utf8'),
      '<!--\n  index: int\n  msg: string\n  time: string\n-->\n<template name="message">\n  <view>\n    <text> {{index}}: {{msg}} </text>\n    <text> Time: {{time}} </text>\n  </view>\n</template>\n'
    )

    t.true(
      mfs
        .readFileSync('/fixtures/template/import.js', 'utf8')
        .includes('this is a template')
    )
    t.is(
      mfs.readFileSync('/fixtures/template/import.wxml', 'utf8'),
      '<view>\n  <import src="../../wxml/message.fd0e28.wxml"/>\n  <template is="message" data="{{...item}}"/>\n</view>'
    )
    t.is(
      mfs.readFileSync('/fixtures/template/import.wxss', 'utf8'),
      'view {\n  color: #00f;\n}'
    )
    t.is(
      mfs.readFileSync('/fixtures/template/import.json', 'utf8'),
      '{\n  "name": "mina"\n}'
    )

    t.pass()
  } catch (error) {
    console.log(error)
  }
})

test('include template', async t => {
  try {
    const { compile, mfs } = compiler({
      entry: './fixtures/template/include.mina',
      output: {
        filename: 'fixtures/template/include.js',
      },
    })
    const stats = await compile()

    t.true(mfs.existsSync('/assets/logo.97017d.png'))
    t.is(
      mfs.readFileSync('/wxml/header.ae94ef.wxml', 'utf8'),
      '<!-- header.wxml -->\n<view><image src="/assets/logo.97017d.png"></view>\n'
    )

    t.true(
      mfs
        .readFileSync('/fixtures/template/include.js', 'utf8')
        .includes('this is a template')
    )
    t.is(
      mfs.readFileSync('/fixtures/template/include.wxml', 'utf8'),
      '<view>\n  <include src="../../wxml/header.ae94ef.wxml"/>\n  <view>body</view>\n</view>'
    )
    t.is(
      mfs.readFileSync('/fixtures/template/include.wxss', 'utf8'),
      'view {\n  color: #00f;\n}'
    )
    t.is(
      mfs.readFileSync('/fixtures/template/include.json', 'utf8'),
      '{\n  "name": "mina"\n}'
    )

    t.pass()
  } catch (error) {
    console.log(error)
  }
})
