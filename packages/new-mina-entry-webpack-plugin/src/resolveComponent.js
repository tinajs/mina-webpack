const fs = require('fs')
const { resolve, relative } = require('path')
const resolveFrom = require('resolve-from')
const Component = require('./Component')

function resolveComponent (rootContext, componentRequest, currentContext) {
  return resolveModuleComponent(rootContext, componentRequest) ||
    resolveContextComponent(rootContext, componentRequest, currentContext)
}

function resolveContextComponent (rootContext, componentRequest, currentContext) {
  if (!currentContext) {
    currentContext = rootContext
  }

  let fullPath = null
  if (componentRequest.startsWith('/')) {
    fullPath = resolve(rootContext, componentRequest.slice(1))
  } else {
    fullPath = resolve(currentContext, componentRequest)
  }
  let componentName = relative(rootContext, fullPath)

  if (fs.existsSync(fullPath) && fullPath.endsWith('.mina')) {
    return new Component({
      context: rootContext,
      request: './' + componentName.replace(/\.mina$/, ''),
      main: '.mina',
      assets: [],
      fullPath: fullPath.replace(/\.mina$/, '')
    })
  } else if (fs.existsSync(fullPath) && fullPath.endsWith('.js')) {
    fullPath = fullPath.replace(/\.js$/, '')
    return new Component({
      context: rootContext,
      request: './' + componentName.replace(/\.js$/, ''),
      main: '.js',
      assets: ['.json', '.wxml', '.wxss'].filter(extension => fs.existsSync(fullPath + extension)),
      fullPath
    })
  } else if (fs.existsSync(fullPath + '.mina')) {
    return new Component({
      context: rootContext,
      request: './' + componentName,
      main: '.mina',
      assets: [],
      fullPath
    })
  } else if (fs.existsSync(fullPath + '.js')) {
    return new Component({
      context: rootContext,
      request: './' + componentName,
      main: '.js',
      assets: ['.json', '.wxml', '.wxss'].filter(extension => fs.existsSync(fullPath + extension)),
      fullPath
    })
  } else {
    return false
  }
}

function resolveModuleComponent (rootContext, request) {
  if (request.startsWith('~')) {
    request = request.slice(1)
  } else if (request.startsWith('./') || request.startsWith('../') || request.startsWith('/')) {
    return false
  }

  let fullPath = null
  if (request.endsWith('.mina') || request.endsWith('.js')) {
    fullPath = resolveModuleRequest(rootContext, request)
  } else {
    fullPath = resolveModuleRequest(rootContext, request + '.mina') 
                  || resolveModuleRequest(rootContext, request + '.js')
  }
  if (!fullPath) {
    return false
  }

  if (fullPath.endsWith('.mina')) {
    return new Component({
      context: rootContext,
      request: request.replace(/\.mina$/, ''),
      main: '.mina',
      assets: [],
      fullPath: fullPath.replace(/\.mina$/, '')
    })
  } else {
    fullPath = fullPath.replace(/\.js$/, '')
    return new Component({
      context: rootContext,
      request: request.replace(/\.js$/, ''),
      main: '.js',
      assets: ['.json', '.wxml', '.wxss'].filter(extension => fs.existsSync(fullPath + extension)),
      fullPath
    })
  }
}

function resolveModuleRequest (rootContext, request) {
  try {
    return resolveFrom(rootContext, request)
  } catch (error) {
    return false
  }
}

module.exports = resolveComponent
