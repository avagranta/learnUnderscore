// 引入自定义函数库
var _ = require('./learnUnderscore.js');

// 函数式调用
_.log('111');

// 面向对象
_('222').log();

// 链式调用
console.log(_.chain('abcde').reverse().reverse().value());