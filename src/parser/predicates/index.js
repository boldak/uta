let _ = require("lodash-node")

class Rule {
	
	constructor(cb){
		this.cond = cb;
		this.thenCb = [d => d]
	}

	test(data){
		return this.cond(data)
	}

	then(cb){
		this.thenCb.push(cb)
		return this
	}

	scan(data){
		return (this.cond(data)) ? 1 : 0		
	}

	map(data){
		let res = data
		this.thenCb.forEach( cb => {
			let temp = cb(res) 
			res = (temp) ? temp : res
		})
		return res	
	}

	apply(data){
		if (this.test(data)) return this.map(data)
	}
}

class OptionalRule {

	constructor(rule){
		this.rule = rule;
		this.thenCb = [d => d]
	}

	test(){
		return true
	}

	scan(data){
		return (this.rule.test(data)) ? this.rule.scan(data) : 0
	}

	then(cb){
		this.thenCb.push(cb)
		return this
	}

	map(data){
		if( this.rule.test(data) ){
			let res = this.rule.map(data)
			this.thenCb.forEach( cb => {
				let temp = cb(res) 
				res = (temp) ? temp : res
			})
			return res	
		}
	}

	apply(data){
		if (this.test(data)) return this.map(data)
	}

}

class NotRule {
	
	constructor(rule){
		this.rule = rule;
		this.thenCb = [d => d]
		this.window = 0
	}

	test(data){
		return !this.rule.test(data) 
	}

	scan(data){
		return (this.test(data)) ? 1 : 0
	}

	then(cb){
		this.thenCb.push(cb)
		return this
	}

	map(data){
			let res = this.rule.map(data)
			this.thenCb.forEach( cb => {
				let temp = cb(res) 
				res = (temp) ? temp : res
			})
			return res	
	}

	apply(data){
		if (this.test(data)) return this.map(data)
	}
}



class AnyRule {
	
	constructor(...rules){
		this.rules = rules[0]
		this.thenCb = [d => d]
	}

	test(data){
		return this.rules.map( r => r.test(data)).filter( r => r).length > 0
	}

	then(cb){
		this.thenCb.push(cb)
		return this
	}

	map(data){
		let r = _.find(this.rules, r => r.test(data))
		if (r) {
			let res = r.map(data)
			this.window = r.window || 1

			this.thenCb.forEach( cb => {
				let temp = cb(res) 
				res = (temp) ? temp : res
			})

			return res	
		}
		
	}

	scan(data){
		let r = _.find(this.rules, r => r.test(data))
		return (r) ? r.scan(data) : 0
	}

	apply(data){
		let r = _.find(this.rules, r => r.test(data))
		if (r) return this.map(data)
	}
}



class NextRule {
	
	constructor(rule){
		this.rule = rule
		this.thenCb = [d => d]
	}

	test(data){
		let d = data.next()
		if(d) return this.rule.test(d)
	}

	then(cb){
		this.thenCb.push(cb)
		return this
	}

	scan(data){
		let d = data.next()
		if(d) return this.rule.scan(d)
	}

	map(data){
		let d = data.next()
		
		if( d ) {
			let res = this.rule.map(d)
			this.thenCb.forEach( cb => {
				let temp = cb(res) 
				res = (temp) ? temp : res
			})
			return res
		}		
	}

	apply(data){
		if (this.test(data)) return this.map(data)
	}
}

class PrevRule {
	
	constructor(rule){
		this.rule = rule
		this.thenCb = [d => d]
	}

	test(data){
		let d = data.prev()
		if(d) return this.rule.test(d)
	}

	then(cb){
		this.thenCb.push(cb)
		return this
	}

	scan(data){
		let d = data.prev()
		if(d) return this.rule.scan(d)
	}

	map(data){
		let d = data.prev()
		
		if( d ) {
			let res = this.rule.map(d)
			this.thenCb.forEach( cb => {
				let temp = cb(res) 
				res = (temp) ? temp : res
			})
			return res
		}		
	}

	apply(data){
		if (this.test(data)) return this.map(data)
	}
}

class CursorRule {
	
	constructor(...rules){
		this.rules = rules[0]
		this.thenCb = [d => d]
	}

	test(data){
		let res = []
		let d = data
		
		this.rules.forEach(r => {
			if(d){
				let t = r.test(d)
				t = (t) ? t : false
				res.push(t)
				if(t) d = (d) ? d.atRight(r.scan(d)) : d
			} else {
				res.push(false)
			}
				
		})

		return res.filter( r => r).length  == this.rules.length
	}

	then(cb){
		this.thenCb.push(cb)
		return this
	}

	scan(data){
		let res = []
		let d = data
		let w = 0
		this.rules.forEach(r => {
			if(d){
				// console.log("--", w, "--", d.item.value)
				let t = r.test(d)
				t = (t) ? t : false
				res.push(t)
				if(t){
					w += r.scan(d)
					d = data.atRight(w)	
				} 		
			} else {
				res.push(false)
			}
				
		})
		// console.log(res)
		return w //(res.filter( r => r).length  == this.rules.length) ? w : 0
	}

	map(data){
		let res = []
		let d = data
		this.rules.forEach( r => {
			res.push((d) ? r.map(d) : null)
			d = (d) ? d.atRight(r.scan(d)) : d	
		})
		
		this.thenCb.forEach( cb => {
			let temp = cb(res) 
			res = (temp) ? temp : res
		})
		return res
	}

	apply(data){
		if (this.test(data)) return this.map(data)
	}
}


class RepeatRule {
	
	constructor(rule){
		this.rule = rule
		this.thenCb = [d => d]
	}

	test(data){
		let res = false
		let d = data
		while(d && this.rule.test(d)){
			res = true
			d = d.atRight(this.rule.scan(d))
		}
		return res
	}

	then(cb){
		this.thenCb.push(cb)
		return this
	}

	scan(data){
		let d = data
		let w = 0
		while(d && this.rule.test(d)){
			w += this.rule.scan(d)
			d = data.atRight(w)
		}
		return w
	}

	map(data){
		let res = []
		let d = data
		
		while(d && this.rule.test(d)){
			res.push(this.rule.map(d))
			d = d.atRight(this.rule.scan(d))
		}
		this.thenCb.forEach( cb => {
			let temp = cb(res) 
			res = (temp) ? temp : res
		})
		
		return res
	}

	apply(data){
		if (this.test(data)) return this.map(data)
	}
}

class AllRule {
	
	constructor(...rules){
		this.rules = rules[0]
		this.thenCb = [d => d]
	}

	test(data){
		return this.rules.map( r => r.test(data)).filter( r => r).length  == this.rules.length
	}

	then(cb){
		this.thenCb.push(cb)
		return this
	}

	map(data){
		let res = this.rules.map( r => r.map(data))
		this.thenCb.forEach( cb => {
			let temp = cb(res) 
			res = (temp) ? temp : res
		})
		return res
	}

	scan(data){
		return (this.test(data)) ? _.max(this.rules.map( r => r.scan(data))) : 0
	}

	apply(data){
		if (this.test(data)) return this.map(data)
	}
}

class AnyData {
	
	constructor(rule){
		this.rule = rule
		this.thenCb = [d => d]
		this.window = 0
	}

	test(data){
		this.window = 0
		data = _.isArray(data) ? data : [data]
		return data.map( d => this.rule.test(d)).filter( d => d).length > 0
	}

	then(cb){
		this.thenCb.push(cb)
		return this
	}

	map(data){
		this.window = 1
		let res = this.rule.map(data)
		this.thenCb.forEach( cb => {
			let temp = cb(res) 
			res = (temp) ? temp : res
		})
		return res
	}

	apply(data){
		data = _.isArray(data) ? data : [data]
		let d = _.find( data, d => this.rule.test(d)) 	
		if (d) return this.map(d)
	}
}

class AllData {
	
	constructor(rule){
		this.rule = rule
		this.thenCb = [d => d]
		this.window = 0
	}

	test(data){
		this.window = 0
		data = _.isArray(data) ? data : [data]
		return data.map( d => this.rule.test(d)).filter( d => d).length  == data.length
	}

	then(cb){
		this.thenCb.push(cb)
		return this
	}

	map(data){
		this.window = 1
		let res = data.map( d => this.rule.map(d))
		this.thenCb.forEach( cb => {
			let temp = cb(res) 
			res = (temp) ? temp : res
		})
		return res
	}

	apply(data){
		data = _.isArray(data) ? data : [data]
		if (this.test(data)) return this.map(data)
	}
}

let e = cb => new Rule(cb)
e = _.extend(e, {
	"true": new Rule(data => true),
	
	"ignore": data => {
		data.skip = true
		return data
	},

	"skip": data => {
		data.skip = true
		return data
	},

	"shift": new Rule(data => true),
	not: rule => new NotRule(rule),
	or: (...rules) => new AnyRule(rules),
	any: (...rules) => new AnyRule(rules),
	and: (...rules) => new AnyRule(rules),
	all: (...rules) => new AllRule(rules),
	anyData: (rule) => new AnyData(rule),
	allData: (rule) => new AllData(rule),
	cursor: (...rules) => new CursorRule(rules),
	sequence: (...rules) => new CursorRule(rules),
	repeat: (rule) => new RepeatRule(rule),
	option: (rule) => new OptionalRule(rule),
	optional: (rule) => new OptionalRule(rule),
	next: (rule) => new NextRule(rule),
	prev: (rule) => new PrevRule(rule)

})

module.exports = e
