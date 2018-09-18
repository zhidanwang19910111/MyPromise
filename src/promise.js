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
            handle(this.resolve.bind(this), this.reject.bind(this))
        }
        catch(err){
            this.reject(err)
        }

    }

    resolve (val) {
        if(this._state !== PENDING) return;
        this._state = RESOLVED;
        this._value = val;
        // console.log(this._state, this._value)
    }

    reject (err) {
        if(this._state !== PENDING) return;
        this._value = err;
        this._state = REJECTED;
        // console.log(this._state, this._value)
    }

    then (onResolved, onRejected) {
        const {_value, _state} = this;

        console.log(this)

        console.log(_value, _state)

        switch (_state) {
            case PENDING:
                this._resolvedQueues.push( onResolved );
                this._rejectedQueues.push( onRejected );
                break;
            case RESOLVED:
                onResolved( _value );
                break;
            case REJECTED:
                onRejected(_value);
                break;
        }

        //返回一个新的promise 对象
        return new MyPromise(() => {})
    }

}