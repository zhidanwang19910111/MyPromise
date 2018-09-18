const isFunction = variable => typeof variable === 'function';

const PENDING = 'pending';
const RESOLVED = 'resolved';
const REJECTED = 'rejected';

class MyPromise {
    constructor (handle) {
        if( !isFunction(handle) ){
            throw new Error('MyPromise resolver undefined is not a function')
        }

        //添加状态
        this._state = PENDING;
        //添加状态值
        this._value = undefined;
        //添加成功回调队列
        this._resolvedQueues = [];
        //添加失败回调队列
        this._rejectedQueues = [];
        try{
            handle(this._resolve.bind(this), this._reject.bind(this))
        }
        catch(err){
            this.reject(err)
        }

    }

    _resolve (val) {
        const run = ()=> {

            if(this._state !== PENDING) return;
            // 依次执行成功队列中的函数，并清空队列
            const runResolved = (value) => {
    
                let cb;
                while (cb = this._resolvedQueues.shift()){
                    cb(value)
                }
            }
             // 依次执行失败队列中的函数，并清空队列
    
             const runRejected = (error) => {
                 let cb;
                 while (cb = this._rejectedQueues.shift()){
                     cb(error)
                 }
             }
    
            /* 如果resolve的参数为Promise对象，则必须等待该Promise对象状态改变后,
                当前Promsie的状态才会改变，且状态取决于参数Promsie对象的状态
            */
    
            if( val instanceof MyPromise){
                val.then(value => {
                    this._value = value
                    this._state = RESOLVED
                    runResolved(value)
                }, err => {
                    this._value =err;
                    this._state = REJECTED
                    runRejected(err)
                })
            }else{
                this._value = val
                this._status = RESOLVED
                runResolved(val)
            }
        }


        setTimeout( run, 0);
        // console.log(this._state, this._value)
    }

    _reject (err) {
        if(this._state !== PENDING) return;
        // 依次执行失败队列中的函数，并清空队列

        const run = () => {
            
            this._state = REJECTED;
            this._value = err;
            let cb;
            while (cb = this._rejectedQueues.shift()) {
                cb(err)
            }
        }

         // 为了支持同步的Promise，这里采用异步调用

         setTimeout(run, 0);
        // console.log(this._state, this._value)
    }

    then (onResolved, onRejected) {
        const {_value, _state} = this;



        //返回一个新的promise 对象
        return new MyPromise((onResolvedNext, onRejectedNext) => {
            //封装一个成功的执行函数
            let resolved = value => {
                try {
                    if( !isFunction(onResolved) ){
                        onResolvedNext(value)
                    }else{
                        let res = onResolved(value);
                        if(res instanceof MyPromise){
                            // 如果当前回调函数返回MyPromise对象，必须等待其状态改变后在执行下一个回调
                            res.then(onResolvedNext, onRejectedNext)
                        }else{
                            //否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
                            onResolvedNext(res)
                        }
                    }
                } catch (err) {
                    // 如果函数执行出错，新的Promise对象的状态为失败
                    onRejectedNext(err)
                }
            }

            //封装一个失败的执行函数
            let rejected = error => {
                try {
                    if( !isFunction(onRejected) ){
                        onRejectedNext(error)
                    }else{
                        let res = onRejected(error);
                        if(res instanceof MyPromise){
                            // 如果当前回调函数返回MyPromise对象，必须等待其状态改变后在执行下一个回调
                            res.then(onResolvedNext, onRejectedNext)
                        }else{
                            //否则会将返回结果直接作为参数，传入下一个then的回调函数，并立即执行下一个then的回调函数
                            onResolvedNext(res)
                        }
                    }
                } catch (err) {
                    // 如果函数执行出错，新的Promise对象的状态为失败
                    onRejectedNext(err)
                }
            }

            switch (_state) {
                case PENDING:
                    this._resolvedQueues.push( resolved );
                    this._rejectedQueues.push( rejected );
                    break;
                case RESOLVED:
                    onResolved( _value );
                    break;
                case REJECTED:
                    onRejected(_value);
                    break;
            }

        })

    }

}