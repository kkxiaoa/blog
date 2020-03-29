---
title: 浅谈js类继承
date: 2020-03-23 21:46:11
tags:
     - JavaScript基础
---



##  前言

对于科班出身的同学来讲，绝大多数应该是从 `过程化编程` 起步，这种风格的代码之包含了过程（函数）调用，没有对基层进行抽象（面条式代码）。

后来我们开始接触到面向对象编程，进而又跟另外一个被称为 `类` 的术语扯上了关系，或者可以说是面向类式编程。

在后来随着编程的深入我们开始接触到 `函数式编程`，这也是一种编程的选择或者习惯。

但我们此次只讨论一下关于类的那些事儿。说到类，我们便会想起三大基本特性 `封装` 、`继承` 、`多态`，而我们此次的主题便是 `继承`。

##  JavaScript 中的 “类”

相较于传统语言，JavaScript 中一直在模仿类行为。直到 ES6 版本出来后才出现了一些近似类的功能，如 `class`、`extends` 、`super`。但是这并不代表 JavaScript 实现了像传统语言一样的类，JavaScript 的核心机制是`[[prototype]]`，并且只有对象，对象只负责定义自身的行为。像这些新定义的语法只是在原型链的基础上进行的封装（语法糖），因此搞懂`[[prototype]]` 才是关键。

说了一些体外话，然后进入主题。我们先来抛出两个小问题：

- 如何实现继承？
- 继承都有那些方法，它们的利弊都是什么？

接下来我们一个个的讲。

##  类式继承

先看一下例子：

```javascript
function Animal() {
  this.categories = ['二哈', '英短', '龙猫'];
}

Animal.prototype.category = function() {
    console.log(this.categories);
}

var animal = function () {}
animal.prototype = new Animal();

var animal1 = new animal();
animal1.category();   // ['二哈', '英短', '龙猫'];
```

这是最基本的类式继承，通过使用父级的构造函数调用来为 `animal.prototype` 进行关联。我们先来说一下使用构造函数调用（new）时会自动执行的一些情况：

1. 创建（构造）一个新对象。
2. 这个新对象会被执行`[[Prototype]]`关联，也就是说这个对新象会关联到`animal.prototype`对象上。
3. 这个新对象会绑定到函数调用的`this`，也就是说此时的`this`指的是 `animal`。
4. 如果函数未返回其它对象，那么使用 `new` 关键字调用函数后会返回这个新对象（也就是 `animal{}`）。

关于`this` 更细致的讨论可以参看TODO

所以当我们执行 `animal1.category()` 操作的时候，因为 `[[Get]]` 操作的默认行为会检查原型链，`animal1`自身没有 `categories` 属性所以会到自身原型链查找，由于`new Animal()`操作返回的对象与`Animal.prototype` 自动关联并且`animal.prototype` 还保存着 `Animal.prototype` 引用，因此`animal1` 便可以顺利的访问到`Animal` 原型链及自身的属性。

我们再来看一下例子：

```javascript
function Animal() {
  this.categories = ['二哈', '英短', '龙猫'];
}

var animal = function () {}
animal.prototype = new Animal();
var animal1 = new animal();
var animal2 = new animal();

console.log( animal1.categories); // ["二哈", "英短", "龙猫"]
animal1.categories.push('柯基');
console.log( animal2.categories); // ["二哈", "英短", "龙猫", '柯基']
```

通过这个例子就可以很明显的看出使用类式继承的问题：

- 如果父级的构造函数（使用new调用）里存在通过`this` 添加引用类型对象，当这个对象被更改时，所有子级都会受到牵连。
- 因为是使用了父级的构造函数调用，子级对象就无法实例化自己的属性。

针对于这些问题我们引出了另外一种继承。

##  构造函数继承

```javascript
function Animal(name) {
    this.name = name;
    this.features = ['装傻卖萌', '好吃懒做'];
}

Animal.prototype.sleep = function() {
    console.log(this.name + '正在睡觉');
}

function Dog(name, voice) {
    Animal.call(this, name);
    this.voice = voice;
}

var dog1 = new Dog('二哈', '汪汪。。');
var dog2 = new Dog('柯基', '汪汪。。');

dog1.features.push('拆家小分队');
console.log(dog1.features);   // ["装傻卖萌", "好吃懒做", "拆家小分队"]
console.log(dog2.features);   // ["装傻卖萌", "好吃懒做"]
console.log(dog1.sleep());    // TypeError: sleep is not a function
```

前面我们有讲到通过构造函数调用的时候发生的情况，由于未执行原型链的关联，所以当执行完构造函数调用之后自动将 `this` 关联到 `Dog` 并为其添加属性。这段代码的核心是 `Animal.call(this, name)` ，这里通过**显示**绑定将 `Animal` 中的属性重新添加到 `Dog` 对象中。

> 提醒： `Animal.call` 和 `Animal.apply` 用法相同，都会更改当前执行上下文环境的this，这种方式称为`this`显示绑定。还有一种被称为应绑定的方法: `bind` ，同样会更改执行上下文环境的this，但 `bind` 会返回执行函数的一个副本。

那既然这两种都不能实现一个完整的继承过程，我们可以结合一下这两种思想，使用构造函数将父级的公有属性与子级的公有属性进行合并，同时要将父级原型链上属性也进行合并（注意子级自已的公有属性要后执行）。注意：不要直接执行父级的构造函数调用，因为使用 `call` 已经执行了调用了构造函数。再使用 `new` 操作相当于执行了两遍重复的操作。

##  原型式继承

最早提出的这一方式的是美国的道格拉斯·克罗克福德（Douglas Crockford），世界著名的前端大师，同时也是`JSON` 的创立者。他提出的这个方案：

```javascript
function inheritObject(proto) {
    function F() {};
    F.prototype = proto;
    return new F();
}
```

这段代码使用了一个一次性函数，通过改写它的 `.prototy` 将它指向想要关联的对象，然后再使用 `new` 操作构造一个新对象进行关联。

```javascript
function Animal(name) {
    this.name = name;
}

Animal.prototype.sleep = function() {
    console.log(this.name + '正在睡觉。');
}

function Dog(name, voice) {
    Animal.call(this, name);
    this.voice = voice;
}

Dog.prototype = inheritObject(Animal.prototype);

Dog.prototype.yell = function() {
    console.log(this.name + '： ' +  this.voice);
}

var dog = new Dog('二哈', '汪汪。。');

dog.sleep();   // 二哈正在睡觉。 
dog.yell();    // 二哈： 汪汪。。
```

需要注意一点：经过 `inheritObject` 后已经没有 `Dog.prototype.constructor` 属性了，因为`Dog.prototype` 指向的是 `Animal.prototype` ，所以如果还需要这个属性，需要手动修复它：

```javascript
function inheritPrototype(subClass, superClass) {
    var f = inheritObject(superClass.prototype);
    f.constructor = subClass;
    subClass.prototype = f;
}
```

##  寄生组合式继承

因此便出现了更加理想的继承方式：

```javascript
function Animal(name) {
    this.name = name;
}

Animal.prototype.sleep = function() {
    console.log(this.name + '正在睡觉。');
}

function Dog(name, voice) {
    Animal.call(this, name);
    this.voice = voice;
}
// 不考虑 construstor 指向的时候：
// Dog.prototype = inheritObject(Animal.prototype); 
// 或者 Dog.prototype = Object.create(Animal.prototype)

// 考虑 construstor 指向的时候：
// 使用Object.create后手动修复construstor: Dog.prototype.constructor = Animal
inheritPrototype(Dog, Animal);
// 或者 Object.setPrototypeOf(Dog.prototype, Animal.prototype)

Dog.prototype.yell = function() {
    console.log(this.name + '饿了： ' +  this.voice);
}

var dog = new Dog('二哈', '汪汪。。');

dog.sleep();   // 二哈正在睡觉。 
dog.yell();    // 二哈饿了： 汪汪。。
```

随着这种方式的深入，后来ES5便出现了 `Object.create` 这个方法，当然这个方法内部还有很多附加功能，但是核心却是如此。但是这样会导致 `constructor` 指向错误，进而我们引出了 `inheritPrototype()` 方法修复其 `constructor` 指向的问题。同样，ES6之后出现了`Object.setPrototypeOf(subProto, superProto)` ，这个方法实际上跟我们自己写的 `inheritPrototype()` 是类似的。

> 如果不考虑 `constructor` 指向错误问题及轻微性能损失（被丢弃F对象会在适当时机被GC回收掉），使用`Object.create`是完全没问题的。
>
> 此外，`Obeject.create` 会创建一个拥有空原型连的对象，这个对象没有原型链，无法进行进行委托。这种特殊的空对象特别适合做为`字典`结构来存储数据。因此，该对象无法使用 `instanceof` 关键字，并且在使用`for..in`遍历对象的时候，使用 `Object.prototype.hasOwnProperty.call` 来避免类型错误。

##  多继承

