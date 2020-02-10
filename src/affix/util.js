let _ = require("lodash-node")

module.exports = {
	generate: path => {
		let parts = path
			.split(":")
			.map( p => p.split("/"))
			.map( p => (p.length == 1) ? p[0] : p)
		let index = _.findIndex(parts, p => _.isArray(p))
		let res = []
		if(index >= 0){
			parts[index].forEach( v => {
				res.push({
					"_test": {
					   "sfx": null,
					   "neg_sfx": null
				  	},
				  	"_from": "0",
				  	"_to": "",		
					tags:_.take(parts,index).concat([v].concat(_.takeRight(parts,parts.length-index-1))).join(":")
				})
			})
		} else {
			res.push({
					"_test": {
					   "sfx": null,
					   "neg_sfx": null
				  	},
				  	"_from": "0",
				  	"_to": "",		
					tags: path
				})
		}
		return res	
	}
}