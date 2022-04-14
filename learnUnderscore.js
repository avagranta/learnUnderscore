// 将所有方法添加到_对象上，再将该对象挂载到全局对象上
(function() {
  // 获取全局对象，对环境进行检测，分别考虑浏览器环境(window/self)、node环境(global)、Web Worker(self)、
  var root = (typeof self === 'object' && self.window === self && self) ||
             (typeof global === 'object' && global.global === global && global);
  
  // 定义_对象，既要支持函数式调用，又要支持对象式调用，因此定义为函数
  var _ = function(obj) {
    // 返回一个对象，该对象原型指向_.prototype
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // 获取_上的方法
  _.functions = function(obj) {
    var names = [];
    // 遍历键名，找到所有方法,存入names中
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  }

  // 判断是否是函数
  _.isFunction = function(obj) {
    if (Object.prototype.toString.call(obj) === 'object Function')
      return true;
    else
      return false;
  }

  // 将_构造函数上的方法复制到_.prototype上
  _.mixin = function(obj) {
    
  }

  // 挂载到全局对象上
  root._ = _;

  // 自定义函数
  _.log = function() {
    console.log(1);
  }
})()

console.log(global);