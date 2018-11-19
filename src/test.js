//判断是否为一个function
var isFunction = value => typeof value === 'function';

const PENDING = 'pending',
      RESOLVED = 'resolved',
      REJECTED = 'rejected';

// 创建一个MPromise对象, 并接受一个 函数作为参数

class MPromise {
  constructor( resolver ) {
    // 参数必须为一个 function
    if( !isFunction( resolver ) ) throw new Error('Mpromise parameter must be a function') 

    // 定义 MPromise 状态
    this.state = PENDING;

    // 定义 成功回调、失败回调收集数组
    this._resolvedArr = [];
    this._rejectedArr = [];

    // 成功或者失败的值
    this._value = null;
    this._error = null;

    // 直接执行handler
    this._handler( resolver )
  }
  // 执行MPromise 传入的函数参数
  _handler( resolver ){
    resolver(
      // 实例对象传入函数的第一个参数 resolve
      value => {
        if( this.state !== PENDING ) return;

        // 判断是否为 MPromise 对象 
        /* p1 的状态决定了 p2 的状态。如果 p1 的状态是Pending，
          那么 p2 的回调函数就会等待 p1 的状态改变；
          如果 p1 的状态已经是 Fulfilled 或者 Rejected，那么 p2 的回调函数将会立刻执行 
        */

        if( value instanceof MPromise){
          value.then( 
            res => {
              this._resolve(res)
            },
            error => {
              this._reject(error)
            }
          )
        }else{

          this._resolve(value)
        }
        
      },
      // 实例对象传入函数的第二个参数 reject
      error => {
        if( this.state !== PENDING) return;
        this._reject( error)
      }
    )
  }
  // resolve函数
  _resolve( value ){
    setTimeout( () => {
      // 修改状态
      this.state = RESOLVED;
      this._value = value;

      //执行 收集到的成功回调队列
      this._resolvedArr.forEach( item => item(this._value))
    }, 0)
  }
  // reject函数
  _reject( error ){
    setTimeout( () => {
      this.state = REJECTED;

      this._error = error;

      this._rejectedArr.forEach( item => item(this._error) )
    }, 0)
  }

  // then方法 传入两个参数，成功回调函数，失败回调函数
  then( resolvedFun, rejectedFun){
    // 返回一个对象 
    return new MPromise( (resolveNext, rejectNext ) => {
      // 判断传入参数是不是为函数
      resolvedFun = isFunction( resolvedFun ) ? resolvedFun : null;
      rejectedFun = isFunction( rejectedFun ) ? rejectedFun : null;

      // MPromise 链式调用

      let fullfilled = (value) => {
        // 如果第一个then 传入的不是个函数，那么就不做处理
        if( !resolvedFun ) {
          resolveNext( value )
          return;
        }
        // 如果是个函数的话 将第一个 then 的返回值传给第二个
        let res = resolvedFun( value )
        resolveNext( res )
      }

      let rejected = ( error ) => {
        if( !rejectedFun ){
          rejectNext( error )
          return;
        }
        let res = rejectedFun(error)
        rejectNext( res )
      }

      if( this.state === PENDING ){
        if( resolvedFun ) this._resolvedArr.push( fullfilled );
        if( rejectedFun ) this._rejectedArr.push( rejected );
      }else if( this.state === RESOLVED && resolvedFun){
        fullfilled( this._value )
      }else if( this.state === REJECTED && rejectedFun){
        rejected( this._error )
      }

    })
  }
}