# this is a my promise

```bash
    改变 this 指向的三个方法

    bind call apply

    三个方法相同点
        目标函数被调用时，改变this的指向为指定值
        三个函数函数方法，挂载在 Funtion.prototype 上


    不同点
        目标函数使用call, apply ，目标函数会主动执行
        目标函数使用bind后，函数不会立即执行，而是返回一个新函数，调用新函数才会执行目标函数
```

```bash
    实现步骤
    1. 实现一个 promise 的实例 resolve(value) value是一个普通的值
    2. 实现 promise 的then 方法  then 方法就是函数的收集器 promise.then
    3. 实现 promise 的 then方法的 链式调用 promise.then.then

    4. 当建立实例的时候  resolve 或者 reject 一个thenable 时候处理
```

```bash
    1. src 下代码目录
    2. test 为项目的测试代码
```