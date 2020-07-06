---
title: 《你不知道的JavaSript》之this
date: 2020-04-04 13:16:11
tags:
     - JavaScript基础
---



##  前言

在 `JavaScripts` 的世界中，有很多神奇的 "魔法" ，像令人琢磨不透的原型链，也有隐晦的闭包。这篇是关于(《你不知道的JavaScript》上卷中`this` )的学习笔记，通过总结和反思让我们真正掌握复杂而又神奇的机制 —— `this` 。

##  令人迷惑的 "动态作用域"

`this` 被定义在所有函数的作用域中，对于传统的高级语言，它们有各自的定义，而在 `JavaScirpts` 中又该如何准确的判断出这个 `this` 到底指向谁或者说跟谁绑定，这似乎是我们此次讨论的重点。但是，`this` 之所以这么让人迷惑大致出于 ——" 动态作用域"，我们先来看一段代码。

```javascript
var a = 2;

function bar() {
    console.log(a);
}

function foo() {
    var a = 3;
    bar();
}

foo();  // 2
```

首先，通过输出的结果来看 `foo` 输出的并不是 2 而不是 3。有人可能会这么想：当执行 `bar()`由于找不到 a 变量的定义时便通过调用栈顺着作用域链在 `foo` 方法中找， 这时候发现定义了 `a = 3` 因此这时候便会输出 3。如果存在 "动态作用域" 就能够很好的解释这个误以为输出为 3 的原因。但是，结果不会骗人，骗人的是这种嵌套的写法。

`JavaScripts` 不存在这种 "动态作用域" 机制，它只有词法作用域，词法作用域让 `bar` 在定义的时候，通过作用域的提升机制引用到了全局（window）对象上定义的变量 `a = 2`。因此，当调用 `bar` 的时候，即便当前处于函数 `bar` 中，此时的作用域是全局对象，跟代码中的嵌套无关。

::: tip
词法作用域是一套解释引擎如何查找变量以及在什么地方找到该变量的规则。词法作用域在书写代码的时候或者定义变量或定义函数的时候就确定了；无论函数在哪里被调用，也不论它如何调用，它的词法作用域都只由被声明时所处的位置所决定。
:::

##  闭包

但是话又说回来，怎么让它输出 3 呢？ 我们通过上述分析之后，得到的结论是由于词法作用域的机制，使得变量`a` 处于全局作用域下。因此，如果我们改变 `bar` 的作用域，让它处于 `foo` 中就行了。来看一下如下代码：

```javascript
var a = 2;

function foo() {
    var a = 3;
    
    function bar() {
        console.log(a);
    }
    
    bar();
}

foo();  // 3
```

没错，利用 `闭包` 机制来访问 `foo` 作用域。但是又有人会感到疑惑，谁是闭包？或者这不就是利用了词法作用域提升的机制将 `bar` 所处的作用域提升到了 `foo` 中了么。其实，拿闭包或者利用作用域的查找规则来解释这段代码都不为过，利用作用域的查找规则来查找 a 的引用也是闭包的一部分，虽然闭包不是我们此次讲解的重点。

我们换一种更为通俗的写法：

```javascript
var a = 2;

function foo() {
    var a = 3;
    
    function bar() {
        console.log(a);
    }
    
    return bar;
}

var baz = foo();
baz();  // 3
```

我们先来看下什么是闭包？

`当函数可以记住并访问所在的词法作用域，即便函数是在它当前的词法作用域之外被执行，这时候就会产生闭包。`

`foo` 函数就是一个包装函数，它的返回值是一个内部函数（也就是bar），然后将内部函数的引用赋值给`baz`，同时内部函数持有外层函数作用域中的变量（a）的引用 ，这个时候bar便持有可以访问覆盖整个 `foo` 函数内部作用域的引用，这个引用就是闭包。所以 `baz` 在被调用的时候，实际上是执行 `foo` 上下文环境的 `bar` ，这时候输出的变量自然是当前作用域下的 `a = 3`。

::: tip
这里我们提到持有该作用域的 `引用` ，既然提到引用必然跟对象有关联。实际上，`JavaScirpts` 的引擎内部有它自已的一套规则，作用域跟对象类似，可见的操作符都是它的属性，只不过该作用域 "对象" 只定义在引擎内部。
:::

##  箭头函数

上面为了帮助我们理解词法作用域引出了闭包的概念。当然，具体关于闭包的介绍不是我们讨论的重点。另外说关于 `this` 还有一个不得不说的就是 `() => ` 箭头函数 。

当然，箭头函数的引入不单单是为了简写 `function` 而引入的，更为有意义的是它能够 "继承" 外层函数的`this` 绑定，让 `this` 在某些场合变得更加 "单纯" 一些，我们来看几个简单的例子：

```javascript
var name = "hello~~";

var obj = {
    name: "kkxiao",
    show: function() {
        console.log(this.name);
    }
}
// 第一种调用方式
obj.show();  // kkxiao

// 第二种调用方式
setTimeout(obj.show, 200); // hello~~

var obj = {
    name: "kkxiao",
    show: () => {
        console.log(this.name)
    }
}

// 改写后第三种调用方式
setTimeout(obj.show, 200); // hello~~

var obj = {
    name: "kkxiao",
    show: function() {
        setTimeout(function() {
            console.log(this.name);
        }, 200)
    }
}

// 改写后第四种调用方式
obj.show();  // hello~~

var obj = {
    name: "kkxiao",
    show: function() {
        setTimeout(() => {
            console.log(this.name);
        }, 200)
    }
}
// 改写后第五种调用方式
obj.show();  // kkxiao

var obj = {
    name: "kkxiao",
    show: function() {
         setTimeout(function() {
            console.log(this.name);
        }.bind(this), 200)
    }
}
// 第六种调用方式
obj.show();  // kkxiao
```

这里有个很容易让人疑惑，稍不留神可能就会出现错误（第二种和第四种）。这里遇到的问题可以详见[隐式绑定](#隐式绑定)，但这个例子我们想要说明的是 `() => ` 箭头函数可以放弃普通 `this` 的绑定规则，并且可以继承它外层的 `this` 绑定。

::: tip

这也不是意味着箭头函数能胜任各种情况，由于它是匿名的，所以在一些场景下它并不比具名函数更有使用的价值。具体来讲，具名函数拥有如下的优点：

1.  在 `debug` 模式下，由于没有合适的名称，调试起来可能不那么方便
2.  在需要引用自身的场景下，匿名函数就显得很无力。比如，在递归的时候需要引用自身，或着在注册监 听事件后（`addEventListener`），需要解绑注册函数的时候具名函数就很重要了
3.  在平时开发的过程中，代码的可读性也是很重要的。

所以合理的使用它，让它发挥出最大的用途。

:::

::: warning

箭头函数虽然可以继承父级作用域，但是它一旦被绑定后就无法更改，稍后我们会讲到。

:::

以上这些似乎都无法解释 `this` 的机制，我们也没弄懂它到底如何工作。不过不要着急，前面只是一些铺垫，理解 `this` 首先要理解词法作用域。

如果不理解词法作用域，我们可能会对 `this` 产生错误的理解：

一、错以为 `this` 指向自身：

```javascript
function timer() {
    this.count++;
}

timer.count = 0;

for(let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
        timer();
    }
}

console.log(timer.count);  // 0
```

这似乎并不像 `this` 字面量那样指向 `timer` 函数自身，但为什么 `count` 会是 0，或着说 `this.count++` 没被执行呢？

前面我们有讲过，执行 `timer` 的时候会检查当前词法作用域中是否存在 `count` 变量，没有的话会发生作用域提升，也就是说会检查全局作用域中是否存在 `count` 。然而依旧不存在，所以执行完 `timer` 之后会在全局对象`window` 下创建 `count` 属性并自增，最后的到 `NaN` 。

既然是执行函数的时候当前上下文属于全局对象 `window` ，手动让其引用自身：

```javascript
function timer() {
    timer.count++;
}

timer.count = 0;

for(let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
        timer();
    }
}

console.log(timer.count);  //  5
```

我们手动将其引用自身的属性 `count`，这也验证了刚刚提及的具名函数的优点（可以引用自身）。这样在调用函数的时候即便当前的调用位置是 `window` 对象，也不影响函数自身创建的属性。或者，我们使用 `call` 来改变当前上下文对象：

```javascript
function timer() {
    this.count++;
}

timer.count = 0;

for(let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
        timer.call(timer);
    }
}

console.log(timer.count);
```

二、错以为 `this` 指向函数的词法作用域：

```javascript
function showName() {
    var name = "abc";
    this.say()
}

function say() {
    console.log(name)
}

showName(); // undefined
```

这里我们稍后会讲 `this` 的具绑定规则，首先明确调用 `showName` 的时候 `this` 使用默认绑定，此时的 `this` 指向 `window`，不要错以为在 `this` 指向 `showName` 的词法作用域，进而会以为在 `say` 中输出 `abc`，`say` 函数的上下文对象依然是 `window`。

实际上函数在被调用的时候，会创建上下文对象（context），这个 `context` 对象里面记录着函数的调用栈（哪里调用的）、调用方式、入参信息以及 `this` 绑定的对象。

因此`this` 既不指向函数自身，也不指向函数的此法作用域，而是通过调用位置的上下文对象来判断 `this`的指向 。

##  绑定规则

刚刚我们提到，`this` 的绑定是在函数执行时才确认的，而执行时会创建 `context`，而 `context` 中的 `this` 则是根据当前执行上下文的词法作用域来确认的。所以，找到函数的 `调用位置` 就显得很重要。

即便有如上的分析，但是有的时候函数的调用位置会迷惑我们。接下来我们就来具体分析 `this` 在绑定过程中的规则，主要有如下四点。

###  默认绑定

我们首先来介绍最常见的函数调用：独立函数调用。这也是四类 `this` 绑定规则的默认规则：

```javascript
function intro() {
	console.log(this.name);
}

var name = "kkxiao";

intro();  // kkxiao
```

大家可以看到 `intro` 被调用时是不带任何修饰的函数引用进行调用的 ，我们都知道当前的调用位置是在全局作用域中，进而直接输出全局对象中的 `name` 属性，类似与这样的独立函数调用便是应用了默认绑定规则。或者我们可以理解为也是使用了的修饰的函数引用调用的，只不过是通过 `window.intro()`调用罢了。因此 `this` 绑定到了全局对象当中。

在严格模式下会报异常错误 `TypeError` ，而在普通模式下正常。

```javascript
function intro() {
    "use strict";
	console.log(this.name);
}

var name = "kkxiao";

intro();  // TypeError: Cannot read property 'name' of undefined
```

这里有个小细节需要另外关注：

```javascript
function intro() {
    console.log(this.name);
}

var name = "kkxiao";

(function() {
    "use strict";
    foo();    // kkxiao
})()
```

::: warning

对于默认绑定来说，决定 `this` 绑定对象的并不是调用位置是否处于严格模式，而是函数体是否处于严格模式。正如上述代码输出的结果：如果函数体处于严格模式下，`this` 会被绑定到 `undefined`；否则，`this` 会绑定到全局对象。

:::

###  隐式绑定

应用该规则的函数调用位置通常存在 `上下文` 对象，但是这里面会有陷阱：

```javascript
var obj = {
    name: "kkxiao",
    say: showName
}

function showName() {
    console.log(this.name)
}

obj.say() // kkxiao

// 或者
var obj = {
    name: "kkxiao",
    say: function() {
        console.log(this.name)
    }
}

obj.say() // kkxiao
```

我们观察它的调用方式：`obj.say()` ；调用的时候 `obj` 对象包裹着 `say` 方法，或者说是上下文环境的 `this` 指向 `obj`，因此这种方式的调用 `this` 会自动绑定到上下午对象上。

此外，通过使用 `obj.say` 这种方式调用，被调用函数前面带着 `obj` 引用；如果对象属性引用链有不止一层的话，那么只有最后一层引用会绑定到 `this` 上：

```javascript
function showName() {
    console.log(this.name)
}

// 注意： 需要先声明 obj2，否则 obj2 会被声明为 undefined, 进而导致 TypeError
var obj2 = {
    name: "kkxiao2",
    say: showName
}

var obj1 = {
    name: "kkxiao1",
    ref: obj2
}

obj1.ref.say()  // kkxiao2
```

::: warning

注意：这里有一个很容易导致隐式丢失的问题，那就是不管是先声明具名 `function` 再将该方法关联到对象属性上也好，还是直接在对象上定义 `function` 也罢，该方法其实不是真正属于这个对象。导致隐式丢失 `this` 也基本上跟这个问题有关，那就是引用在传递后原来绑定在上下午对象可能会改变或丢失。

:::

####  隐式丢失

刚刚我们已经提到关于隐士绑定会出现非常常见的问题 —— 隐式丢失。一旦先前绑定的对象（在运行时通过上下文确认）丢失，那它很可能会绑定到全局 `window` 或者 `undefined` （严格模式下）上。我们通过几个例子来分析一下：

第一种：引用通过显示的赋值给某一变量

```javascript
function showName() {
    console.log(this.name)
}

var obj = {
    name: "kkxiao",
    say: showName
}

var toSay = obj.say;

var name = "hello~~";

toSay();  // hello~~
```

导致这个原因是将 `obj.say` 引用赋值给 `toSay` ，但 ``obj.say`` 引用的是 `showName`，所以最后通过 `soSay()` 调用相当于全局作用域下调用 `window.toSay()` ，只不过这里的上下文环境是 `window` 或者说使用了默认绑定规则。

第二种：使用回调函数

```javascript
function showName() {
    console.log(this.name)
}

function toSay(fn) {
    // 这里 this 指向 window
    fn(); // <-- 调用位置
}

var obj = {
    name: "kkxiao",
    say: showName
}
// 或者函数直接声明在对象上
// var obj = {
//    name: "kkxiao",
//    say: function() {
//        console.log(this.name)
//    }
//}

var name = "hello~~"

toSay(obj.say); // hello~~
```

首先，`fn`是通过 `toSay` 方法的参数进行隐式传递，前面我们在讲默认绑定的时候，函数通过不带任何修饰的函数引用进行调用或者说通过独立函数调用的时候，`this` 默认绑定全局对象（window）。所以，`showName` 方法的上下文对象是 `window` 。但是我们看到为什么 `toSay` 方法的上下文对象也是指向 `window` ？ 同理，调用 `toSay` 方法的时候也是独立函数调用呀。

或许有的小伙伴还有疑问：那如果强制改变`toSay` 上下午环境对象会怎么样？我们知道 `call`、`apply`、`bind`可以改变上下午对象指向，这个其实属于另外一种 `this` 绑定规则 —— 显示绑定，稍后我们会讲到。但是，为了说明现在遇到的问题，我们先来使用 `call` 测试一下：

```javascript
function showName() {
    console.log(this.name)
}

function toSay(fn) {
    // 此时 this 指向 obj
    fn(); // <-- 调用位置
}

var obj = {
    name: "kkxiao",
    say: showName
}

var name = "hello~~";

toSay.call(obj, obj.say); // hello~~ 
//或者
toSay.bind(obj, obj.say)(); // hello~~ 
```

是不是觉得会输出`kkxiao`？ 我们来分析一下： 使用 `call` 后现在的 `toSay` 的上下文对象变成了 `obj` ，但是输出结果依旧没有变化。这个原因之前我们已经提到过 `this` 的指向既不指向函数自身也不指向函数的词法作用域（函数`toSay`的词法作用域是`window`），通过 `call` 得知此时的上下文虽然指向 `obj`，但是真正执行 `fn` 的时候是不带任何修饰函数的引用调用的（独立函数调用）。所以，这时的 `this` 绑定依然是使用默认规则即`fn`的`this` 指向 `window`。

我们来看一下使用 `call` 或者 `bind` 后怎么才能让它输出我们想要的结果：

```javascript
function toSay(fn) {
    // 此时 this 指向 obj
    this.say(); // <-- 调用位置
}
```

其实只需要输出当然上下文对象的 `say` 方法即可，因为上下文对象已经改变。

除此之外，对于内置函数的 `callback` 调用也是如此，像 `setTimeout`、`setInterval`等：

```javascript
function showName() {
    console.log(this.name)
}

var obj = {
    name: "kkxiao",
    say: showName
}

var name = "hello~~";

setTimeout(obj.say, 200); // hello~~
```

想这些通过回调函数调用的例子，很容易出现 `this` 隐式丢失的问题。`setTimeout` 定时器跟我们写的 `toSay` 方法里执行 `fn` 是一样的，最后都是应用了默认绑定规则。

第三这种：间接引用

```javascript
function showName() {
    console.log(this.name)
}

var name = 'kkxiao';

var obj = {
    name: "hello",
    say: showName
}

var obj1 = {
    name: "world"
}

obj.say();  // hello  隐式绑定规则

(obj1.say = obj.say)(); // kkxiao
```

针对于 `obj.say` 大家应该都很清楚这是应用了隐式绑定规则，但是`(obj1.say = obj.say)()` 这种方式调用为什么会是输出全局作用域下的变量呢？ 

大家仔细想一想，`obj1.say = obj.say` 它们都引用了谁？ 其实，它们都是引用了全局作用欲下的 `showName` 方法。但导致输出这一结果的或者说让人产生疑惑的地方在于 `obj1.say` ，以为采用了隐式绑定规则，其实不然，我们稍微留下神就会发现，它其实是通过 `showName()` 独立函数调用的。既然是独立函数调用那就是采用了默认绑定规则，普通模式下 `this` 指向 `window` ， 严格模式下 `this`  绑定为 `undefined`。

刚开始是不是觉得很疑惑？ 与我们分析的过程相比，其实结果本身并不那么重要了，重要的是我们通过这些例子来搞懂了 `this` 在隐士绑定的规则。

再次回到我们讨论的话题，既然隐式绑定容易造成 `this` 丢失，那该如何做能固定住我们期望的 `this` 呢？下面我们接着介绍显示绑定。

###  显示绑定

我们再将隐式绑定的时候提到过，那就是通过`call` 、`apply` 、`bind`。这三种都可以显示的改变上下文对象，但是 `call` 和 `apply` 的区别就在于参数上，而 `bind` 会返回绑定函数的的拷贝函数，同时支持柯里化。

还有一些细节我们稍后会讲到，我们先来看下显示绑定：

```javascript
var obj = {
    name: 'kkxiao'
}

function showName() {
    console.log(this.name)
}

showName.call(obj); // kkxiao
```

####  硬绑定

我们先来看一下什么是硬绑定，其实再讲隐式绑定的时候我们提到过：

```javascript
function showName() {
    console.log(this.name)
}

function toSay(fn) {
    fn.call(obj); // <-- 调用位置
}

var obj = {
    name: "kkxiao",
    say: showName
}

var name = "hello~~"

toSay(obj.say); // kkxiao
// 或者
setTimeout(showName.bind(obj), 100);  // kkxiao
```

大家注意到 `toSay` 方法里面显示的使用 `call` 来改变上下午对象，这样的话即便是独立函数调用也不受影响，因为上下文对象已经改变。其次 `bind` 跟它思路类似，都是可以手动强制更改上下文对象，只不过调用方式会有些不同。此外，`bind` 的功能不限于更改上下文对象，它还可以用作[函数柯里化](https://www.zhangxinxu.com/wordpress/2013/02/js-currying/)。

需要注意一点，当使用显示绑定（call、apply）的时候如果不关心当前的上下文对象，当传入 `null` 或 

`undefined` ，这时候 `this` 会被绑定到 `window`（非严格模式下）：

```javascript
function foo() {
    console.log(this.a);
}

var a = 123;

foo.call(null); // 123
```

就像这样，一旦传入 `null` 或 `undefined` 的时候需要主要是否会造成负面作用，需要谨慎。

此外需要说一下，即便强制更改上下文对象，但是有些情况 `this` 丢失的问题依然存在：

```javascript
var obj = {
    name: "kkxiao"
}

var name = "hello"

function showName() {
    return function() {
        console.log(this.name)
    }
}

var say = showName.call(obj);

var say1 = showName.bind(obj)();

say();   // hello
say1();  // hello
```

小伙伴们可能会有疑惑，这里好像是应用了闭包，但是为什么却应用了默认绑定规则呢？ 我们来分析一下，如果调用 `showName.call` 或者 `showName.bind` 产生了一下闭包，那么即便是独立函数调用，也不会影响到闭包，因为 `say` 和 `say1` 如果是闭包引用，那么它关联的是覆盖整个 `showName` 内部整个作用域 `this` 自然是我们强制更改后的对象 `obj`，最后会如愿输出 `kkxiao` 。

事实并非我们想的那样，结果输出的是全局变量 `hello` ，说明 `say` 和 `say1` 引用的不是指向 `showName` 内部作用域的闭包。仔细想一下，这个问题和我们讨论隐式绑定间接引用的例子很接近，当时我们讨论最后确认原因是间接引用的函数的调用方式为独立函数调用。我们回头看一下这个例子，`showName` 返回的是一个 `function` 然后赋值给 `say` 变量，最后调用 `say` 方法不就是间接引用的例子是一个问题么；所以，抛除其它因素，单看这个例子它确实是采用了隐式绑定规则。

话又说回来，这个`showName`如果创建了闭包环境，那结果就又不一样了。

我们回顾一下前面我们讨论闭包的时候，产生闭包需要具备两前提条件：一是调用了想要创建内部作用域的包装函数；二是包装函数的返回值必须至少包括一个对内部作用域的引用。我们再来分析一下上述的`showName` 方法，可以发现其实我们少了一个很关键的因素 —— 返回值必须至少包括一个对内部作用域的引用。

我们先来打印一下当前上下文对象都是什么：

```javascript
var obj = {
    name: "kkxiao"
}

var name = "hello"

function showName() {
    console.log(this); // {name: "kkxiao"}
    return function() {
        console.log(this.name) // this 指向 window
    }
}

var say = showName.call(obj);

var say1 = showName.bind(obj)();

say();   // hello
say1();  // hello
```

可以看到返回的函数外层作用域绑定的 `this` 是 ` {name: "kkxiao"}` ，这符合预期（使用显示绑定更改上下文对象）。但如何产生闭包呢？ 我们只需要一个外层作用域的一个引用：

```javascript
function showName() {
    console.log(this); // {name: "kkxiao"}
    var that = this;   // 引用自身即可
    return function() {
        console.log(that.name) // this 指向 window
    }
}
```

就像这样，返回的函数中有外层作用域的一个引用，这样就会创建一个指向 `showName` 内部作用域的一个闭包并把它赋值给 `say` 和 `say1` 并利用利用了词法作用域的查找规则成功访问到 `showName` 的内部作用域。

###  new绑定

前面介绍了三种 `this` 的绑定规则，最后一种便是 `new` 绑定。具体来讲当使用类似 `new myFunction()` 的时候会发生什么，我们可以参见 `new` [运算符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/new)，它默认执行如下操作：

1.  创建一个空的简单JavaScript对象（即`**{}**`）
2.  这个新对象会被执行 [[Prototype]] 连接（或者继承 `myFunction.prototype`）
3.  `this` 会被绑定到该新对象上
4.  如果 `myFunction` 未返回其它对象，最后的 `new` 操作会返回这个新创建的对象

如：

```javascript
function Person(name, age, sex) {
   this.name = name;
   this.age = age;
   this.sex = sex;
}

var kk = new Persion('kkxiao', 25, '男');

kk.name; // kkxiao
kk.age;  // 25
kk.sex;  // 男
```

这也是最常见的或者说构建 "类" 对象的操作，这里的 `this` 绑定便称为 `new` 绑定。

##  优先级

说完了四种 `this` 的绑定规则，我们在来说说它们之间优先级。日常开发中，可能这些不起眼的操作时常会出现在你的代码中，同一种代码中可能应用了好几种规则，但是它们的优先级是需要我们格外注意的。

因为默认绑定（window 或 undefined）的优先级毫无疑问是最低的，剩下三种的优先级我们逐步查看。这里的例子是我们此次学习的书中的提到的例子。

隐式绑定和显示绑定：

```javascript
function foo() {
    console.log(this.a);
}

var obj1 = {
    a: 123,
    foo
}

var obj2 = {
    a: 456,
    foo
}

obj1.foo(); // 123
obj2.foo(); // 456

obj1.foo.call(obj2); // 456
obj2.foo.call(obj1); // 123
```

这说明隐式绑定和显示绑定同时存在的话，显示绑定的优先级更高。

隐式绑定和 `new` 绑定：

```javascript
function foo(id) {
    this.id = id;
}

var obj1 = {
    foo
}

var obj2 = {}

obj1.foo(1);
console.log(obj1.id); // 1

obj1.foo.call(obj2, 2);
console.log(obj2.id); // 2

var bar = new obj1.foo(3);
console.log(obj1.id); // 1
console.log(bar.id); // 3
```

这个 demo 说明了在隐身规则和 `new` 绑定规则存在的情况之下，`new` 绑定规则的优先级更高。但是我们也同样看到了，显示绑定和 `new` 绑定它俩之间的优先级谁会更高呢？

因为 `call` 和 `apply` 不能使用 `new`运算符，但是 `bind`方法可以使用，并且 `new` 运算符和 `bind` 一起使用的时候 `this` 会忽略传入的上下午对象，而是和当前调用的 `new` 运算符的对象之上：

```javascript
function foo(id) {
    this.id = id;
}

var obj = {};

var bar = foo.bind(obj);
bar(123);
console.log(obj.id); // 123

var baz = new bar(456);
console.log(obj.id); // 123
console.log(baz.id); // 456
```

我们看到在当使用 `new` 运算符调用通过 `bind`返回的绑定函数的时候，它并没有将 `this` 绑定到我们提供的 `obj` 对象之上，而是将 `this` 绑定到了一个新对象之上。

接下来我们来看一下`MDN上面的`上面的 `bind` [polyfill实现](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) :

```javascript
if (!Function.prototype.bind) (function(){
  var slice = Array.prototype.slice;
  Function.prototype.bind = function() {
    var thatFunc = this, thatArg = arguments[0];
    var args = slice.call(arguments, 1);
    if (typeof thatFunc !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - ' +
             'what is trying to be bound is not callable');
    }
    return function(){
      var funcArgs = args.concat(slice.call(arguments))
      return thatFunc.apply(thatArg, funcArgs);
    };
  };
})();
```

但是这段 `polyfill` 无法使用 `new` 运算符，因为无论如何 `this` 都会强制绑定到传入的对象上（`null` 和 `undefined`）会应用默认绑定规则。如今我们使用的 `bind` 是支持 `new` 操作符的，下面我们稍微改造一下：

```javascript
if (!Function.prototype.bind) (function(){
  var slice = Array.prototype.slice;
  Function.prototype.bind = function() {
    
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - ' +
             'what is trying to be bound is not callable');
    }
      
      var thatFunc = this, thatArg = arguments[0],
          args = slice.call(arguments, 1),
          F = function () {},
          fBind = function () {
              var funcArgs = args.concat(slice.call(arguments))
              return thatFunc.apply(
                  (this instanceof F ? this : thatArg), funcArgs)
          };


        F.prototype = this.prototype;
        fBind.prototype = new F();
        // fBind.prototype = Object.create(this.prototype)
      
      return fBind;
  };
})();
```

`this` 的优先级的问题：

- new 绑定

new绑定的优先级最高，通过new绑定创建的[对象的过程](#new绑定)上文已经提到。因此，通过new绑定的对象的`this`指向很容易区分。

- 显示绑定

其次便是显示绑定，涉及到的方式以 `call`、`apply`、`bind` 为主，其中 `bind` 又可以称作为[硬绑定](#硬绑定)。通过显示绑定的对象可以更改上下午对象。

- 隐式绑定

再后就是隐式绑定，隐式绑定是关于 `this` 指向中最让人产生疑惑的一种，由于 `this` 在函数调用时的位置不定，所以此时的上下午对象也会不确认。不过，就其 `this` 指向来讲，我们已经分析了[大部分的情况](#隐式丢失) 。因此，只要确认了 `this`调用时候的上下午对象就能确认出此时的 `this` 指向。  

- 默认绑定

这也是四种规则中最基础的一种，它的优先级最低。需要注意的一点是，在严格模式下，默认绑定规则中的 `this` 会被绑定到 `undefined`，否则会绑定到全局对象（window）上。

##  箭头函数的 `this` 指向

关于箭头函数，之前我们已经介绍了一部分。这里我们再补充几点与 `this` 指向相关的内容：

- 继承外层函数上下午对象

```javascript
function Fn() {
    setTimeout(() => {
        console.log(this.a)
    }, 0)
}

Fn.call({a: '测试箭头函数'})   // 测试箭头函数
```

- 箭头函数一旦被绑定就无法被修改

```javascript
function Fn() {
    return () => {
        console.log(this.a)
    }
}

var obj1 = {a: 'obj1.a'}
var obj2 = {a: 'obj2.a'}

var fn = Fn.call(obj1);
fn.call(obj2);  // obj1.a

function Fn() {
    setTimeout(() => {
        console.log(this.a);
        setTimeout((() => {
            console.log(this.a);
        }).bind({a: '强制更换绑定'}), 0)
    }, 0)
}

Fn.call({a: '首次绑定'});
// 首次绑定
// 首次绑定
```

箭头函数没有自已的 `this`、`arguments`、`super`或者使用 `new.target`，并且不能当作构造函数进行调用。因此，它更适用于匿名的场景。

##  总结

我们通过实例讲解了 `this` 指向的问题，如果想要真正的掌握它还需要在平时写代码的时候仔细品味。不过，理解它的前提条件不会改变： `this` 是在函数调用时发生的绑定，它的指向取决于函数在哪里被调用（确认被调用位置的上下午对象）。只要明确这一点，`this`指向问题就能清晰的辨析。







