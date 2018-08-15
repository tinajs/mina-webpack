const fs = require('fs')
const { resolve, relative, sep } = require('path')
const resolveFrom = require('resolve-from')
const Component = require('./Component')

function resolveComponent (rootContext, componentRequest, currentContext) {
  componentRequest = normalizeRequest(componentRequest)
  if (/^(.\/|..\/|\/)/.test(componentRequest)) {
    return resolveContextComponent(rootContext, componentRequest, currentContext)
  } else {
    return resolveModuleComponent(rootContext, componentRequest)
  }
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
  let componentName = relative(rootContext, fullPath).split(sep).join('/')

  if (fs.existsSync(fullPath) && fullPath.endsWith('.mina')) {
    return new Component({
      context: rootContext,
      request: './' + componentName,
      assets: [],
      fullPath: fullPath
    })
  } else if (fs.existsSync(fullPath) && fullPath.endsWith('.js')) {
    return new Component({
      context: rootContext,
      request: './' + componentName,
      assets: getAssets(fullPath),
      fullPath
    })
  } else if (fs.existsSync(fullPath + '.mina')) {
    return new Component({
      context: rootContext,
      request: './' + componentName + '.mina',
      assets: [],
      fullPath: fullPath + '.mina'
    })
  } else if (fs.existsSync(fullPath + '.js')) {
    return new Component({
      context: rootContext,
      request: './' + componentName + '.js',
      assets: getAssets(fullPath + '.js'),
      fullPath: fullPath + '.js'
    })
  } else {
    return false
  }
}

function resolveModuleComponent (rootContext, request) {
  let fullPath = null
  if (fullPath = resolveModuleRequest(rootContext, request)) {
    // request = request
  } else if (fullPath = resolveModuleRequest(rootContext, request + '.mina')) {
    request += '.mina'
  } else if (fullPath = resolveModuleRequest(rootContext, request + '.js')) {
    request += '.js'
  } else {
    return false
  }

  if (fullPath.endsWith('.mina')) {
    return new Component({
      context: rootContext,
      request,
      fullPath,
      assets: []
    })
  } else {
    return new Component({
      context: rootContext,
      request,
      fullPath,
      assets: getAssets(fullPath)
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

function normalizeRequest (request) {
  if (request.startsWith('~')) {
    return request.slice(1)
  } else if (/^(.\/|..\/|\/)/.test(request)) {
    return request
  } else {
    return './' + request
  }
}

// fullPath.endsWith('.js')
function getAssets (fullPath) {
  fullPath = fullPath.replace(/.js$/, '')
  return ['.json', '.wxml', '.wxss'].filter(extension => fs.existsSync(fullPath + extension))
                                    .map(extension => fullPath + extension)
}

module.exports = resolveComponent
