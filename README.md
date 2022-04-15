# 前言
通过学习冴羽大佬的两篇博客，理解underscore的实现，并做了学习笔记。
https://github.com/mqyqingfeng/Blog/issues/56
https://github.com/mqyqingfeng/Blog/issues/57
# 一、如何写自己的underscore

## 1. 主要思路

- 在匿名自执行函数中创建一个对象（_），再将自己方法添加到该对象上，最后通过模块导出。

> 注意：
>
> - 实现的是一个工具函数库，不仅要求可以运行在浏览器端，还可以运行在诸如node等环境中
> - 既要实现函数式调用，也要实现对象式调用

### 1.1 获取全局对象

```js
// 获取全局对象，对环境进行检测，分别考虑浏览器环境(window/self)、node环境(global)、Web Worker(self)、
  var root = (typeof self === 'object' && self.window === self && self) ||
             (typeof global === 'object' && global.global === global && global);
```

> 暂未考虑 node vm模块与微信小程序下的环境

### 1.2 创建自己的对象

如果只是把_定义为一个空对象，我们可以做到函数式的调用，但不能使用面向对象的调用方式

```js
// 函数式调用
_.reverse('abcde');

// 面向对象风格
_('abcde').reverse();
```

因此，我们可以把 _ 定义为一个函数，再把自己的函数添加在该函数上，同时让该函数在调用时能够返回一个对象，并让该对象能够使用 _ 函数上的方法。

```js
// 获取全局对象，对环境进行检测，分别考虑浏览器环境(window/self)、node环境(global)、Web Worker(self)、
  var root = (typeof self === 'object' && self.window === self && self) ||
             (typeof global === 'object' && global.global === global && global);
  
  // 定义_对象，既要支持函数式调用，又要支持对象式调用，因此定义为函数
  var _ = function(obj) {
    // 如果传入的obj已经是 _的实例了，就直接返回
    if (obj instanceof _) return obj;
    
    // 如果传入的obj不是_的实例，则返回 _构造函数的一个实例，该实例原型指向_.prototype
    if (!(this instanceof _)) return new _(obj);
    
    // 将该数据保存在对象中
    this._wrapped = obj;
  };
```

但是，此时返回的实例对象不能直接访问构造函数上的方法，因此我们需要将 _ 上的方法复制到 _.prototype 上，供实例使用。

首先，我们要获取 _函数上的方法，通过 _.functions 函数实现

```js
// 获取_上的方法(得到键名)
  _.functions = function(obj) {
    var names = [];
    // 遍历键名，找到所有方法,存入names中
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  }
```

通过mixin方法复制到 _.prototype上

```js
  // 将_构造函数上的方法复制到_.prototype上
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      // var func = _[name] = obj[name];
      var func = _[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        [].push.apply(args, arguments);
        return func.apply(_, args);
      }
    })
    return _;
  }
// 执行mixin
_.mixin(_)
```

### 1.3 导出 _ 对象

采用 module.exports 的方式导出，使用require引入

```js
  // 挂载到全局对象上, 以及模块化导出
  if (typeof module != 'undefined') {
    module.exports = _;
  } else {
    root._ = _;
  }
```



## 二、如何实现链式调用

## 1. 主要思路

实现链式调用的关键在于，每次调用函数之后，返回这个实例对象。

### 1.1 返回调用对象

在underscore中，默认不适用链式调用，但可以通过 _.chain函数使用。

在调用chain函数后，返回一个对象

```js
// 使用链式调用, 要实现链式调用，需要让每个函数返回一个对象，并保存此次结果，因此用chainResult包裹，此外还需要用value方法最后将对象的值返回
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  }
/* 返回的对象
{
    _chain: true,
    _wrapped: [1, 2, 3]
}
*/
```

### 1.2 包裹函数的返回值

此外，还需要将函数的返回值做一层包裹，让原型上的所有方法，在_chain属性为true的情况下，都能返回一个对象，通过wrapped属性存储当前的结果。可以通过修改mixin统一实现。

```js
// 使用chainResult函数包裹返回值
  var chainResult = function(instance, obj) {
    return instance._chain ? _.chain(obj) : obj;
  }

// 将_构造函数上的方法复制到_.prototype上
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      // var func = _[name] = obj[name];
      var func = _[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        [].push.apply(args, arguments);
        // 修改前：return func.apply(_, args);
        // 修改后：
        return chainResult(this, func.apply(_, args));
      }
    })
    return _;
  }
```

### 1.3 取出最终结果

最后，要在返回的对象中取出最后的结果，即链式调用结束的结果。使用 _.value获取结果。

```js
// 使用_.value 返回最后的值
  _.prototype.value = function() {
    return this._wrapped;
  }

// 最后的调用方式为：
console.log(_.chain('abcde').reverse().reverse())
// 'abcde'
```



至此，完成一个基本的效果。