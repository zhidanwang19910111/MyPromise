(function(window) {
    let state = {
        pedding: 0,
        fulfilled: 1,
        rejected: 2
    }
    class cusPromise {
        constructor (handler) {
            

            this.state = state.pedding
            this._handler(handler)

            this._resolvedArr = [];
            this._rejectedArr = [];

            this._value = null;  // 记录resolve函数传入的参数
			this._error = null;  // 记录reject函数传入的参数
        }
        _handler(handler) {
            // 承诺只能改变状态一次

            let down = false
            handler( (value) => {
                if(down) return
                down = true
                let then = this._getThen( value )
                if( then ){
                    this._handler( then.bind(value))
                }

                this._resolve(value)
            }, (error) => {
                if(down) return
                down = true

                if(this._getThen( value )){

                }
                
                this._reject(error)
            })
        }
        _getThen(value) {
            let type = typeof value;
            if(value && ( type == 'object' || type == 'function')){
                let then;
                if(then = value.then){
                    return then;
                }
                return null;
            }
        }
        _resolve(value) {
            setTimeout( () => {
                this.state = state.fulfilled
                this._value = value;
                this._resolvedArr.forEach( item => item(  this._value ))
            }, 0)
        }
        _reject(error) {
            setTimeout( () => {

                this.state = state.rejected
                this._error = error;
                this._rejectedArr.forEach( item => item( this._error))
            }, 0)
        }

        _done(FulfilledFun, RejectedFun) {
            FulfilledFun = typeof FulfilledFun === 'function' 
                                ? FulfilledFun : null;
            RejectedFun = typeof RejectedFun === 'function'
                                ? RejectedFun : null;
            if( this.state === 0){
                if( FulfilledFun ) this._resolvedArr.push( FulfilledFun )
                if( RejectedFun ) this._rejectedArr.push( RejectedFun )
            }else if( this.state === 1){
                FulfilledFun(this._value)
            }else if ( this.state === 2 ){
                RejectedFun(this._error);
            }
        }
        then(FulfilledFun, RejectedFun) {
            this._done(FulfilledFun, RejectedFun)
        }
    }

    window.cusPromise = cusPromise;
})(window)