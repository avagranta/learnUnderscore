var _ = require('./learnUnderscore.js');
// console.dir(_.log);
_.log('111')
console.log(_.chain('abcde').reverse().reverse().value());