---
title: 浅谈js对象
date: 2020-03-21 21:46:11
tags:
     - JavaScript基础
---



##  前言

最近在整理js基础方面相关的文档，整理到对象的时候发现这一块的内容看似简单但实际上却有很多容易忽视的点，本文就此次话题进行整理和总结，我们先抛出几个问题：

- 对象到底是什么？
- 该如何描述一个对象？

我们先来聊下一些基本概念。

##  语法

我们知道对象是创建无序键 / 值对数据结构（映射）的主要机制。对象的创建可以通过常用的两种形式：字面量和构造形式。

对象的字面量：

```javascript
var obj = {
    key: 'value1',
    arr: [1, 2, 3],
    foo: function() {
        // todo
    }
}
```

构造器形式：

```javascript
 var obj = new Object();

 obj.key = "value1"
 obj.arr = [1, 2, 3],
 obj.foo = function() {
 	// todo
 }
```

其实 `var obj = {}` 是 `new Object()` 的语法糖，它们生成的对象是一样的。唯一的区别是便体现在了添加属性的时候，字面量可以添加多个键 / 值对，而构造形式必须逐个添加属性。

##  语言类型

在 JavaScript 中最新的语言类型包括8种：

- string
- number
- boolean
- null
- undefined
- symbol
- bigint （新增）
- object

简单基本类型（原始数据类型）除 object 以外，它们本身不是对象，但有些是存在它们的包装类型，如：number 的 Number()，string 的 String() 等。

> 注意： 虽然 `typeof null === 'object'` 为true，但这是`js` 本身的一个 bug ，修复的话可以会造成更多意料之外的 bug 。
>
> 《你不知道的JavaScript》 上卷中对象一节提及到实际上不同的对象在底层都表示为二进制，在 `js` 中二进制前三位都为 0 的话是被判定为`object` 类型的，而 `null` 的二进制表示全是 0 ，所以执行 `typeof` 的时候会返回 `object`。

与简单基本类型相对的是复杂类型，如 `Function` 、`Array`，它们都属于对象的子类型。

##  内置对象

除了刚刚提及的`function`、 `array`，还有一类子类型对象即内置对象：

- Boolean
- Number
- String
- Function
- Array
- Date
- RegExp
- Error
- Object

它们实际上都是内置函数，或者称它们为类，可以通过 `new` 运算符调用构造器产生。

我们可以发现一些内置对象是跟基本类型相照应的，先看一下例子：

```javascript
var str = "hello, 你好"
str.indexOf(',')   // 5
str.charAt(5)      // ,

var number = 12.122;
number.toFixed(2)  // 12.12
```

这些列子说明了 `js` 引擎在编译运行的时候会先把基础类型的数据自动装箱，然后就可以调用其自身可以访问或者原型链上再或者顶级 `Object` 原型上定义的属性或方法了。

`null` 和 `undefined` 没有对应的包装类型，相反 `Date` 没有对应的字面量形式。

##  可计算属性名

对象可以通过点（`.`）语法访问属性值，也可以通过 `[]` 类似数组访问值的形式访问属性值。ES6新增的可计算属性名便可以通过 `[]` 这种语法来操作对象的属性：

```javascript
var suffix = '.png'
var imgConfig = {
    ['img1' + suffix]: 'http://abc.com',
    ['img2' + suffix]: 'http://abc.com',
    ['img3' + suffix]: 'http://abc.com'
}
```

稍后我们还会提及一个使用`Symbol.iterator`作为计算属性名的自定义迭代器，可以配合`for..of` 使用。

##  对象拷贝

针对于浅复制可以使用 ES6 定义的 `Object.assign` 实现浅拷贝。但是针对于深拷贝的问题要复杂很多，必须要考虑很多情况，诸如各种类型的对象的拷贝，循环引用等问题，具体分析可以参见我的另一篇文章[浅谈js继承](./浅谈js继承.html)

##  属性描述符

在ES5之前，JavaScript 未提供可以表述对象属性及自身属性检查的方法。从ES5之后，我们创建的对象都具备了属性描述符。

```javascript
var obj = {
	name: "kkxiaoa"
}

Object.getOwnPropertyDescriptor(obj, 'name');
// {
//	  configurable: true
//    enumerable: true
//    value: "kkxiaoa"
//    writable: true
// }
```

在创建普通属性时属性描述符会使用默认值，可以`Object.defineProperty` 进行修改已有属性的描述，前提是它的 `configurable` 必须为 `true` 。

###  Writable

writable决定了属性是否可以被修改：



```javascript
var obj = {};

Object.defineProperty(obj, 'id', {
    value: 1,
    writable: false,
    configurable: true,
    enumerable: true
})

obj.id = 2;
obj.id;    // 1
```

在非严格模式下，修改一个只读属性的值默认会忽略。但是在严格模式下，则会抛出异常：

```javascript
"use strict";

var obj = {};

Object.defineProperty(obj, 'id', {
    value: 1,
    writable: false,
    configurable: true,
    enumerable: true
})

obj.id = 2; // TypeError
```

像这样便会报类型错误异常，表示无法修改只读属性的值。

###  Configurable

默认创建对象的时候，属性 `configurable` 为 `true` 表示可以使用 `defineProperty` 进行配置，但是当手动更改它的可配置属性为 `false` 的时候，再次使用 ``defineProperty`` 则会抛出异常：

```javascript
var obj = {};

Object.defineProperty(obj, 'id', {
    value: 1,
    writable: true,
    configurable: false,
    enumerable: true
})

obj.id; // 1
obj.id = 2;
obj.id; // 2

Object.defineProperty(obj, 'id', {
    value: 1,
    writable: true,
    configurable: true,
    enumerable: true
})     // TypeError Cannot redefine property: id
```

> 注意： 
>
> 1. 把 configurable 修改为 false 是单项操作，不能撤销 
> 2. 在 `configurable` 为 `false` 的前提下仍然可以将 `writable` 由 `true` 置为 `false`  但是无法由 `false` 置为 `true`
> 3. 在 `configurable` 为 `false` 的前提下该属性无法被删除

###  Enumerable

该属性代表对象的属性是否可被枚举，如 `for..in` 或 `Object.keys` 等遍历中就是通过该属性来遍历可枚举的属性。

>  注意： 这里的 `for..im` 和 `in` 操作符是两回事，`in` 操作符是检查该熟悉是否存在于制定对象中，不论它是否可枚举。

###  不变性

有时候我们希望定义一些常量，这时候可以使用 `const` 关键字。但是如果我们想定义一个常量类，这里面存放的是一些基础性的配置属性，我们并不希望它被扩展，属性被改写或删除，这个时候我们可以使用下列方法让这个对象密封或冻结。

####  对象常理

我们可以结合 `writable： false` 和 `configurable: false 创建一个不可变的常量`，这样的话该属性不能被删除、重定义、修改：

```javascript
var Constants = {};

Object.defineProperty(Constants, 'NUMBER_KEY', {
    value: 'AAFJJ1231',
    writable: false,
    configurable: false
})
```

####  禁止扩展

如果想要禁止一个对象添加新属性并且保留已有属性，可以使用 `Object.preventExtensions` ：

```javascript
var obj = {
    id: '111'
}

Object.preventExtensions(obj);

obj.key = 'abc';
obj;  // {id: '111'}
```

在严格模式下会报异常，在普通模式下会忽略扩展。

####  密封

如果在`禁止扩展`的前提下不想让属性进行配置删除操作（可修改）可以使用 `Object.seal()` ，该方法会在现有的对象上使用`Object.preventExtensions`，并把现有属性 `configurable` 更改为 `false` 。

####  冻结

如果想要在 `密封`的前提下禁止修改对象属性，可以使用 `Object.freeze()` ，该方法会在现有对象上调用`Object.seal()`，把所有数据访问属性的 `writable` 置为 `false`。

> 注意：使用 `freeze` 方法只会冻结对象本身及任意直接属性，对于那些保存着对象引用的属性则不受该方法的影响。如果想要深度冻结，可以通过递归的方式遍历该对象，检测到引用对象的存在时使用 `freeze` 方法，但这样可能会冻结掉`全局`共享的对象，请小心使用。

### [[Get]]

属性的访问（不管是通过 `.` 或者 `[]`）访问属性的时候实际上是实现了 `[[Get]]`操作（类似于方法调用），当我们访问某一属性的时候，如：`obj.id` ，语言内部首先在对象上查找是否具备相同名称的属性，存在则返回其值。否则会遍历该对象的原型链，存在的话返回其值。如果都不存在`[[Get]]` 操作会返回 `undefined`：

```javascript
var obj = { id:  undefined };

obj.id;  // undefined
obj.key; // undefined
```

这两种都是返回 `undefined` 但是 `obj.key` 则会进行更复杂的处理，其不仅仅是查找自身，还会遍历原型链。

我们再看一个常见的例子：

```javascript
function Foo(id) {
    this.id = id
}

Foo.prototype.getId = function() {
    return this.id
}

var a = new Foo(1);
var b = new Foo(2);

a.getId()  // 1
b.getId()  // 2
```

我们都知道这样是可以访问的，但是仔细的品一下通过 `Object.keys`(a) 它里面只有 `id` 一个属性，会什么可以访问到 `getId()` 方法呢？ 答案就是通过 `[[Get]]` 的默认行为属性在自身不存在时检查原型链。

### [[Put]]

与 `[[Get]]` 操作相对应的便是 `[[Put]]`操作，起初我认为给对象赋值便会触发`[[Put]]`操作来实现编辑或者创建行为，但是真正当`[[Put]]` 被触发的时候，这里面有多种因素可能导致赋值不会使用默认行为，其中一个最终要的因素便是该属性是否存在于其自身：

- 如果该属性存在于其自身（非原型链）上，`[[Put]]`操作将会进行如下检查：
  1. 属性是否是访问描述符？是并且存在`Setter` 则直接调用 `Setter` 。
  2. 属性的数据描述符中的 `writable` 是否为 `false` ？如果是，在普通模式下值会被忽略，而在严格模式下会抛  出 `TypeError` 异常。
  3. 如果以上两种情况都不存在，则会对该属性赋值。
- 如果该属性存在于其原型链上，`[[Put]]`操作会出现的三种情况：
  1. 如果原型链上存在同名的属性，并且它的数据描述符中的 `writable` 不为 `false` ，那么就会在该对象上添加一个同名的新属性并赋值。
  2. 如果原型链上存在同名的属性，并且它的数据描述符中的 `writable` 为 `false` ，在严格模式下会抛出`TypeError` 异常，在普通模式下则会忽略本次赋值。
  3. 如果原型链上存在同名的属性且它是访问描述符 `Setter` 那就会调用这个 `Setter` ，并不会添加新的属性到这个对象上。

###  Getter 和 Setter 

前面我们讲到了数据描述符（用来描述数据的行为），与之相对应便是访问描述符（`getter、setter`），如果属性定义了访问描述符（两者都存在的时候）`JavaScript` 会忽略它们的 `value` 和 `writable` 特性，取而代之的是`get` 、`set` 、`configurable` 、`enumerable` 的特性。

对象属性值的设置和获取默认使用 `[[Set]]` 和 `[[Put]]`，ES5中可以使用 `Getter` 和 `Setter`改写对象的默认操作，它们都是隐藏函数。如果对某一属性设置了 `getter` 那么获取属性值的时候会被调用。同理，`setter` 则会在对属性设置值的时候被调用。

> 注意： `getter` 和 `setter` 只能绑定到单个属性上面。如果想要为整个对象上的属性进行定义，则可以遍历对象使用 `defineProperty` 对属性进行改造。如 Vue 中的变化侦测机制就是将整个对象使用`getter` 和 `setter` 进行改造的。

我们先来看下如何定义它们：

```javascript
var person = {
    get name() {
        return 'kkxiaoa'
    }
}

Object.defineProperty(person, 'say', {
    get: function() {
        return 'hellow, my name is ' + this.name
    },
    enumerable: true
})

person;      // {} 因为是隐藏函数，我们并未定义属性
person.name; // 'kkxiaoa'
person.say   // 'hellow, my name is kkxiaoa'
Object.keys(person)  // ['name', 'say']
```

这是两种定义 `getter` 的方式，不管使用那一种，我们看到都会创建一个不包含值的属性。我们获取对应的属性的时候会自动调用 `getter` 隐藏函数。由于我们只定义了 `getter`，我们设置属性值试试：

```javascript
person.name = 'abc'
person.name;  // 'kkxiaoa'
```

可以看到对 `name` 赋值会被忽略，由于我们并未定义 `setter` 结果是符合预期的。我们接着定义一下 `setter`，它会覆盖该属性的默认 `[[Put]]` 操作。

```javascript
var person = {
    get name() {
        return 'hello, ' + this._name
    },
    set name(name) {
        this._name = name  // 定义一个新属性存储，不要使用name，否则会造成循环引用
    }
}

person.name = 'world'
person.name;   // 'hello, world'
```

##  遍历

讲到遍历会想到刚刚我们提及的属性描述符 `enumerable` ，它们是紧密关联的。对于对象的遍历我们最常见的有`for..in`、`Object.keys`、`for..of`，我们先来谈谈关于存在性的问题。

我们知道 `in` 和 `hasOwnProperty` 都可以判断属性是否存在于对象上，但是它俩的区别就是 `in` 除了自身外还会查找整个原型链是否存在该属性（不论该属性是否可枚举），`hasOwnProperty` 同样是检查的属性不论是否可被枚举但它只会在对象本身查找，不会检查原型链。

`for..in` 循环会遍历对象自身及原型链上可枚举属性、`Object.keys` 会遍历对象自身可枚举的属性。此外需要注意的是，这个循环只能获取到 `key` ，并不能直接获取对象中属性的值。

如果想要直接获取到属性的值可以使用 ES6 新增的 `for..of` 进行遍历，前提是该对象已经定义了迭代器属性。

```javascript
var arrList = [1, 2, 3];

for (let v of arrList) {
    console.log(v)
}

// 1
// 2
// 3
```

由于数组有内置的@@iterator，可以直接使用它：

```javascript
var arrList = [1, 2, 3];
var it = arrList[Symbol.iterator]();

it.next();   // {value: 1, done: false}
it.next();   // {value: 2, done: false}
it.next();   // {value: 3, done: false}
it.next();   // {value: undefined, done: true}
```

> 注意： 引用像iterator这样的特殊对象的时候要使用符号名，通过`Symbol.iterator` 来获取@@iterator内部的属性。

这里的迭代器执行了四遍才执行完，和`java` 的迭代器机制类似，每次迭代 next 的时候内部指针（虽然js中没有指针的概念）都会向前移动并返回对象属性列表的下一个值（需要注意遍历属性/值的顺序）。

由于普通对象创建的时候未实现迭代器（@@iterator），导致对象无法使用 `for..of` 。但是我们可以手动在对象上实现自定义的迭代器。

```javascript
var obj = {
    a: 1,
    b: 2
}

Object.defineProperty(obj, Symbol.iterator, {
    enumerable: false,
    configurable: true,
    writable: false,
    value: function() {
        var that = this, idx = 0, keys = Object.keys(that);
        return {
            next: function() {
                return {
                    value: that[keys[idx++]],
                    done: (idx > keys.length)
                }
            }
        }
    }
})

// 使用迭代器遍历
var it = obj[Symbol.iterator]();

it.next()  // {value: 1, done: false}
it.next()  // {value: 2, done: false}
it.next()  // {value: undefined, done: true}

// 使用for..of遍历
for(let v of obj) {
    console.log(v)
}
// 1
// 2
```

这里的思路就是通过闭包产生迭代计数器，每次遍历返回列表的下一个值。我们甚至可以自定义我们想要的任何迭代器。需要注意的是`Symblol`是不可枚举的。

##  小结

对象是创建无序键值对的一种数据结构，可以通过字面量创建，也可以通过 `new` 关键字调用构造器函数创建，但一般使用字面量更常见，可以通过 `.` 语法和 `[]` 来访问属性获取属性值。

属性可以通过数据描述符（默认创建方式）及访问描述符来进行操作，使用它们可以实现我们想要的结构，如：禁止扩展、密封、冻结等操作。

属性不一定包含值，它们可以是通过`setter` 和 `getter` 来操作对象。

通过遍厉我们了解到 `enumerable` 属性描述符的作用，介绍了  `for..of`  、`Object.keys`及`for..of` 对遍历对象时各自的用途，其中通过`for..of` 我们了解到可以为对象自定义迭代器来使用 `for..of` 遍历。