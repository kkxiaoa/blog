---
title: 浅谈js深拷贝
date: 2020-03-15 21:46:11
tags:
     - JavaScript
---



## 前言

最近在整理js相关的文档，回想起一个前端说难不难，说简单又能考验职业素养(基本功)扎实程度的问题：js之深浅拷贝的问题，相信前端的同学都或少或多的了解及懂得其根由，在这里我就不多赘述，咱们先简单的抛出几个问题：

- 如何理解深浅拷贝？
- 怎么实现一个较为完善的深拷贝？

我们先来聊下如何理解深浅拷贝。

## 值和引用

我们知道，许多变成语言，赋值和参数传递可以通过值复制（value-copy）或者引用复制（reference-copy）来完成，这取决于语法的不同。

JavaScript 中引用指向的是值。如果一个值有不止一个引用，这些引用都指向的是同一值，他们相互之间没有引用 / 指向关系。

JavaScript 对值和引用的赋值 / 传递在语法上无法区分，完全取决于值得类型来决定。

来看一下下面的列子：

```javascript
var a = 3;
var b = a; // b是a值的一个副本
b++;
a = 3;
b = 4;

var c = [0, 1, 2];
var d = c; // d是[0, 1, 2]的一个引用
d.push(3);
c; // [1, 2, 3, 4]
d; // [1, 2, 3, 4]
```

简单值（即标量基本类型）总是通过值复制的方式来赋值 / 传递， 包括` null` 、`undefined` 、`字符串` 、`number`、`布尔值`和 ES6 中的` symbol` 以及最新的 `bigint `七种基本类型。

复合值（compound value）—— 对象（包括数组和封装对象）和函数，总是通过引用复制的方式来赋值 / 传递。

上例中 3 是一个标量基本数据类型，所以变量 a 持有该值的一个副本，b 持有它的另一个副本。b 更改时，a 值保持不变。

c  和 d则分别指向同一个符合值 [0, 1, 2] 的两个不同引用。请注意，c 和 d 仅仅是指向值 [0, 1, 2], 并非持有。所以它们更改的是同一值（调用 push 方法），随后它们都指向了更改后的新值 [0, 1, 2, 3]。

由于引用指向的是值本身而非变量，所以一个引用无法更改另一个引用的指向。

```javascript
var a = [1, 2, 3];
var b = a;
a; // [1, 2, 3]
b; // [1, 2, 3]

b = [4, 5, 6];
a; // [1, 2, 3]
b; // [4, 5, 6]
```

b=[4, 5, 6] 并不影响 a 指向 [1, 2, 3]，除非 b 指向的不是数组的引用，而是指向 a 的指针，这样 b 的赋值就会影响到 a ，但是 JavaScript 中不存在这种情况。

> 注意：JavaScript 中没有指针的概念，引用的工作机制也不尽相同，在 JavaScript 中变量不可能成为指向另一个变量的引用。

<img :src="$withBase('/栈内存.jpg')" alt="foo">

我们再看一个例子：

```javascript
var m = [1, 2, 3];

function fn(n) {
    n.push(4);
    n; // [1, 2, 3, 4]
    
    n = [4, 5, 6];
    n.push(7);
    n; // [4, 5, 6, 7]
}
fn(m);
m; // 是[1, 2, 3, 4] 而不是 [4, 5, 6, 7]
```

在调用函数传递参数的时候，实际上是将引用 m 的一个副本赋值给 n，所以在当调用 push(4) 操作的时候，因为都指向同一对象 [1, 2, 3, 4] ，但是当手动改变 n 的引用的时候，这时候并不影响 m，所以才会出现最终的 m 是[1, 2, 3, 4] 而不是 [4, 5, 6, 7]。

如果我们不想要函数外的变量受到牵连，可以先创建一个复本，这样就不会影响原始值。例如：

```javascript
fn(n.slice())
```

不带参数的`slice()` 方法会返回当前数组的一个浅复本，由于传递给函数的是指向该副本的引用，所以内部操作n 就不再影响 m 。

目前为止，我们大致理解了不同类型的数据在复制的时候可能会造成相互的影响，所以实现一个深拷贝就显得很有必要了。

接下来我们将会逐步的展开介绍，最终实现一种较为完善的深拷贝。


## 序列化版本

没错，这也是最容易想到的一种，仅仅通过序列化和反序列化实现。

```js
JSON.parse(JSON.stringify());
```

这种写法虽然可以应对大部分的应用场景，但是它还是有很大缺陷的，比如拷贝拷贝函数、循环引用结构、其他类型的对象(Reg、Map)等情况。
> 使用`JSON.stringify`注意：
>
> 2. `undefined`、任意的函数以及 symbol 值，在序列化过程中会被忽略
> 3. 对包含循环引用的对象（对象之间相互引用，形成无限循环）执行此方法，会抛出错误
> 4. 其他类型的对象，包括 Map/Set/WeakMap/WeakSet，仅会序列化可枚举的属性

所以使用这种方法仅适用数据格式简单的对象。

## 属性复制（浅复制）

如果是浅拷贝的话，类似于 `jqery` 里面的extend，很简单仅仅做的是遍历属性进行赋值：

```js
function clone(target) {
    let _target = {};
    for (const key in target) {
        _target[key] = target[key];
    }
    return _target;
};
```

如果是深拷贝的话，并且不知道嵌套对象的层级结构，我们可以使用递归来实现：

```js
function deepClone(target) {
    if (typeof target === 'object') {
        let _target = {};
        for (const key in target) {
        	_target[key] = deepClone(target[key]);
        }
        return _target;
    } else {
        return target;
    }
};
```

虽然这里基本实现了一个深拷贝的 demo，但是我们应该会想到缺少点什么。没错，就是`Array` ，其实考虑到`Array` 的情况也很简单，我们稍微该一下。

## 数组和对象字面量

其实思路很简单，就是在我们每次遍历创建新对象的时候对数组进行兼容就 ok 了：

```js
function deepClone(target) {
    if (typeof target === 'object') {
        let _target = Array.isArray(target) ? [] : {};
        for (const key in target) {
        	_target[key] = deepClone(target[key]);
        }
        return _target;
    } else {
        return target;
    }
};
```
目前为止，我们基本上实现一个深拷贝的例子。但是，就像我们会考虑到数组的情况，还有一种情况不常见，但却不能忽视的一个问题： 循环引用（circularReference）。


## 循环引用

我们执行下面这样一个测试用例：

```js
const target = {
    refer: 'circularReference'
};
target.refer = target;
```

我们在控制台上输出一下：

<img :src="$withBase('/circleReference.jpg')" alt="foo">

可以看到一个无限展开的结构（即对象的属性间接或直接的引用了自身的情况）。

首先来分析一下循环引用结构：如果我们不对存在循环引用的结构做处理的话，每次递归都会指向自身对象，这样下去就会造成内存泄漏的问题。解决这个问题我们就从根本点出发，针对于循环结构我们可以再每次循环的时候找一个`chche` 存储当前对象，下次拷贝的时候就可以去`cache` 中查找有无当前对象，有就返回，没有就继续遍历拷贝，我们先来实现一下这个：

```javascript
function deepClone(target, cache = []) {
  	if (target === null || typeof target !== 'object') {
       return target
    }
    
    let circleStructure = cache.filter(e => e.original === target)[0]
    if (circleStructure) {
        return circleStructure.copy
    }
    
    let copy = Array.isArray(target) ? [] : {}
    cache.push({
        original: target,
        copy
    })
    
    Object.keys(target).forEach(key => {
        copy[key] = deepClone(target[key], cache)
    })
    
    return copy
}
```

> 该方法缺陷：
>
> 1. 只能克隆 `{}` 格式的对象，对于拥有有原型链的对象却无能为力
> 2. 不能克隆其它类型的对象（可迭代的集合、`RegExp`、`Symbol`、`Date`、`TypedArray`）等等

 针对目前的缺陷我们寻找解决方案：

- 既然针对 `{}` 类型对象不能拷贝原型链，我们可以拷贝它的原型对象并且扩展其熟悉
- 针对于可迭代的集合（Map、Set）因为`Object.keys()`无法对其进行便利，那我们可以使用它们自身的构造器
- 针对其它类型的对象我们同要可以使用它们各自的构造器进行拷贝

要区分对象类型，我们首先要找到一个可以严格判断对象类型的方法。之前因为看`vue`源码的时候看到一个严格判断对象类型的方法，通过`Object.toString`方法可以返回对象的具体类型：

```javascript
function getPlainObjType(obj) {
    return Object.prototype.toString.call(obj)
}
```

相信很多小伙伴在阅读其他组件库的时候该方法可以随处可见。其次我们想一想（先把`function` 排除在外）针对于集合类型，我们可以使用`键-值`对的`map`进行存储，但是如果使用对象作为映射的键，这个对象即便后来所有的引用被解除了，某一时刻（`GC`）开始回收其内存，那`map`本身仍然会保持其项目（值对象），除非手动的移除项目（clear）来支持 `GC`。

这个时候`WeakMap`的作用便显现出来，其实它们二者外部的行为特性基本一样，区别就体现在了内存分配的工作方式。

`WeakMap`**只**接受对象作为键，并且这些对象是被弱持有的，也就是说如果键对象本身被垃圾回收的话，那么`WeakMap`中的这个项目也会被自动移除，这也是为什么`WeakMap`在这方面会优于`Map`。我们看个例子：

```javascript
var wm = new WeakMap();

var x = {id: 1},
    y = {id: 2},
    z = {id: 3},
    w = {id: 4};

wm.set(x, y);

x = null;       // {id: 1} 可被垃圾回收
y = null;       // {id: 2} 可被垃圾回收， 实际上 x = null; weakMap里面的项目也就被回收了

wm.set(z, w);

y = null; 		// {id: 4} 并未被回收，因为键还软关联着 {id: 4} 这个对象

```

接下来完善一下上面的`deepClone`方法，`lodash`上实现了比较全面的神拷贝，我们可以借鉴一下`lodash`的思路，实现一个简化版的：

- 声明克隆需要的几种工具函数
- 将 `cache` 替换为`WeakMap`
- 如果判断是基础类型的数据，直接返回
- 声明`deepInit`
- 如果是`map`或者是`set`使用它们自身的添加方法拷贝
- 如果是数组或者是`{}`使用`Object.keys`遍历拷贝属性
- 如果是包装类型对象或者是`Date、RegExp、Symbol`类型的对象使用它们的构造器进行拷贝

```javascript
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errTag = '[object Error]',
    mapTag = '[object Map]',
    arrTag = '[object Array]',
    objTag = '[object Object]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    argsTag = '[object Arguments]',
    symbolTag = '[object Symbol]';


function getPlainObjType(obj) {
    return Object.prototype.toString.call(obj)
}

// 判断对象类型
function isObject(obj) {
    var type = typeof obj;
    return obj != null && (type == 'object' || type == 'function');
}

// 其它(内置)引用类型对象
function isReferObj(type) {
    return ~([dateTag, errTag, regexpTag, symbolTag].indexOf(type))
}

function isSet(type) {
    return type === '[object Set]'
}

function isMap(type) {
    return type === '[object Map]'
}

// 返回传入对象构造器，这样就可以拷贝原型链属性
function deepInit(obj) {
    const Ctor = obj.constructor;
    return new Ctor();
}

function cloneObjByTag(object, tag) {
    var Ctor = object.constructor;
    switch (tag) {
      case dateTag:
        return new Ctor(+object);

      case errTag:
        return new Ctor(object);

      case regexpTag:
        return cloneRegExp(object);

      case symbolTag:
        return cloneSymbol(object);
  }
}

function cloneRegExp(object) {
    let reFlags = /\w*$/;
    let result = new object.constructor(object.source, reFlags.exec(object));
    result.lastIndex = object.lastIndex;
    return result;
}

function cloneSymbol(object) {
    return Object(Symbol.prototype.valueOf.call(object));
}

function deepClone(target, wm = new WeakMap()) {
    if (!isObject(target)) {
        return target;
    }
    
    let type = getPlainObjType(target);
    let copy = deepInit(target);
    
    // 判断是否存在循环引用结构
    let hit = wm.get(target);
    if (hit) {
        return hit;
    }
    wm.set(target, copy);
    
    if(isReferObj(type)) {
        copy = cloneObjByTag(target, type);
        return copy;
    }
    
    if (isSet(type)) {
        target.forEach(value => {
            copy.add(deepClone(value));
        });
        return copy;
    }
    
    if (isMap(type)) {
        target.forEach((value, key) => {
            copy.set(key, deepClone(value));
        });
        return copy;
    }
    
    Object.keys(target).forEach(key => {
        copy[key] = deepClone(target[key], wm)
    });
    
    return copy;
}

```

> 注意： 因为拷贝对象属性的时候使用的是`Object.keys` 暂且先不考虑 `typedArray` 类型对象和`Function`，我们将列举出来的对象类型分为可遍历对象和不遍历代对象（内置对象），使用不同的遍历方法进行属性复制，`Map` 和 `Set`类型可以使用其自带的`forEach`遍历，对象、数组使用`Object.keys`进行遍历，其它内置的引用类型对象直接使用其构造器重新生成新对象。

其实写到这里相当于完成了一大部分，`lodash` 做了很多细节上面的优化工作，比如针对于对象层级非常多的时候特意对遍历这块做了些手脚：

```javascript
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}
```

> 比较`for`、`for..in `、`while`循环，由于 `for..in `会遍历整个对象上包括(原型链)的除`Symbol`以外的可枚举属性，所以会慢些。但是网上诸多帖子的测试结果发现`for`、`while`相差不多，总的单纯从执行时间长短来讲 `while` 更快一些。
>
> 还有一些使用迭代器遍历的方法，例如：`forEach` 、`every`、`some` 它们的唯一区别在于对回调函数返回值的处理方式不同：`forEach` 会遍历数组中的所有之并忽略回调函数的返回值。`every` 会一直运行直到 `callback` 返回 `falsy`，`some` 会一直运行知道回调函数返回 `truthy` 。上例便是模仿 `every` 行为来进行遍历。
>
> 还有一些遍历是访问对象属性时用到的：`Object.keys` 、`Object.getOwnPropertyNames`。这些和 `in` 的区别：`Object.keys` 只会遍厉对象直接包含的可枚举属性，`Object.getOwnPropertyNames` 会遍历对象直接包含的属性（不论它们是否可枚举）。 `in`  操作符会查找对象（包括原型链）属性是否存在（不论是否可以遍历），`for..in ` 会遍历整个对象上包括(原型链)的除`Symbol`以外的可枚举属性。
>
> 此外，ES6新增的 `for..of` 可以对数组的值进行遍历（如果对象自身定义了迭代器也可以进行遍历）。

可以很清楚的看到使用`while`是重写了`forEach`，这里的 `array` 需要值得注意：

- 如果遍历的是对象那么`key`和`value`需要对调，因为对象的 `key` 是数组的值而非下标
- 自定义迭代回调函数的时候可以根据不同逻辑设置返回值来中断遍历

我们可以改一下`deepClone` 中的遍历的逻辑：

```javascript

let keys = Array.isArray(target) ? undefined : Object.keys(target);

// Object.keys(target).forEach(key => {
//     copy[key] = deepClone(target[key], wm);
// });

arrayEach(keys || target, (value, key) => {
    if (keys) {
        key = value
    }
    copy[key] = deepClone(target[key], wm);
})
```

目前来讲`Function`类型和二进制数组的`typedArray`还未实现深拷贝没不过目前来讲，日常开发使用最多的也还是序列化和饭序列化版本。而且我也不经常使用这个封装的深拷贝，写这么些东西只是出于学习和扩展思路用的，真正用的话 `lodash` 的完全够用了，后续还会去继续研究 `function` 和`arrayBuffer`的拷贝。

由于深拷贝需要考虑的`edge case`太多，相信大家也会有很多探讨，写一个深拷贝不容易。具体孰优孰劣也需要跟业务想结合一下。

##  参考

- [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [lodash](https://lodash.com/)
- [WeakMap](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/WeakMap)
- [数据结构和数据类型](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures)

##  小结

1. 针对于深浅拷贝我们先引出了值和引用，简单值（即标量基本类型）总是通过值复制的方式来赋值 / 传递复合值（compound value）—— 对象（包括数组和封装对象）和函数，总是通过引用复制的方式来赋值 / 传递，并且引用之间并不相互影响，从而点出深拷贝的相关思路。
2. 首先使用最广泛的序列化进行拷贝，但限于序列化对`function`、集合、包装对象、引用对象自动忽略，由此引出了递归拷贝。
3. 考虑到循环引用问题引出利用缓存避免拷贝陷入死循环。
4. 由于未考虑到原型链的属性，引出了利用构造器来拷贝对象，进而引出了更多数据类型的深拷贝。针对于集合形式的对象，我们引用了对内存分配支持更好的`WeakMap`来作为缓存对象。从而引出了像`symbol`、`正则`、及其他引用类型的对象的拷贝问题。
5. 最后分析了`lodash`对于拷贝时遍历的性能的优化，给了我们一个在遍历数据量很大时一个思路。