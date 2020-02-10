
class Queue {
	constructor(callback){
		this.iterations = 0
		this.callback = callback
	}

	_run(i, resolver) {
		i = i || 0
		if(!resolver){
			return new Promise( resolve => {
			resolver = resolve
			this.callback(i)
				.then(() => {
					if(i < this.iterations) {
						this._run(i+1, resolver)
					} else {
						resolver()
					}	
				})	
			})	
		} else {
			this.callback(i)
				.then(() => {
					if(i < this.iterations-1) {
						this._run(i+1, resolver)
					} else {
						resolver()
					}	
				})	
		}
	}
	run(iterations){
		this.iterations = iterations
		return this._run()
	}
} 

module.exports = callback => (new Queue(callback))