//
// Inject missing variables back
//  into the global object
//  (used by corejs in the Wechat-Mini-Program environment)
//
// see:
// - https://github.com/zloirock/core-js/blob/0b4981/packages/core-js/internals/global.js
//
;(function() {
  try {
    var global = new Function('return this')()

    function polyfill(name, value) {
      if (!global[name]) {
        global[name] = value
      }
    }

    polyfill('parseInt', parseInt)
    polyfill('parseFloat', parseFloat)
  } catch (e) {}
})()
