let fs = require("fs")
let _ = require("lodash-node")


let GROUP = /group/g
let SUBGROUP = /subgroup/g
let LINE_COMMENT = /^#/
let GROUP_TEST = /\:$/

let R_S_SPLITTER = "@"
let TAG_GROUP_SPLITTER = "//"
let TAG_VAR_SPLITTER = "/"
let TAG_SPLITTER = ":"



let getRecords = compoundRecord => {
	let res = []
	
	let znaMap = {
		"1": "ranim",
		"2": "rinanim"
	}

	let _test = _.extend({},compoundRecord._test)
	// _test.sfx = (_test.sfx == true) ? { test:(s => true) } : new RegExp(`${_test.sfx}$`)
	// _test.neg_sfx = (_test.neg_sfx == false) ? { test:(s => false) } : new RegExp(`${_test.neg_sfx}$`)

	_from = compoundRecord._from //(compoundRecord._from == "0") ? null : new RegExp(`${compoundRecord._from}$`)

	let groups = compoundRecord.tags.split(TAG_GROUP_SPLITTER)

	let main = groups[0].split(TAG_SPLITTER)[0]

	groups.map ( (g, index) => (
		((index > 0 ) ? [main] : [] )
			.concat( 
				g.split(TAG_SPLITTER)
				.map( t => t.split(TAG_VAR_SPLITTER)) 
			)
	))
	.map( g => g.map( t => (_.isArray(t)) ? (t.length == 1) ? t[0] : t :t ))
	.forEach( g => {
		let i = _.findIndex(g, t => _.isArray(t))
		if(i >= 0){
			let v = g[i]
			v.forEach( t => {
				res.push( {
						group: compoundRecord.group,
						_test: _test,
						_from: _from,
						_to: compoundRecord._to,
						tags: _.take(g,i).concat(
									(/v_zn\d/.test(t)) ? ["v_zna",znaMap[t.split(/v_zn/)[1]]] : [t]
							  ).concat(_.takeRight(g, g.length-i-1)).join(":")
					} 
				)
			})		
		} else {
			res.push({
				group: compoundRecord.group,
				_test: _test,
				_from: _from,
				_to: compoundRecord._to,
				tags: g.join(":")
			})
		}
	})

	return res
}

let getGroupTest = l => {
	parts = l.split(":")
	let sfx = [] 
	let neg_sfx = []

	if (parts[0].trim().startsWith("-")){
		neg_sfx.push(parts[0].trim().substring(1))
	} else {
		sfx.push(parts[0])
	}
	
	if (parts[1].trim().startsWith("-")){
		neg_sfx.push(parts[1].trim().substring(1))
	} else {
		sfx.push(parts[1])
	}

	return {
		sfx: sfx.filter(s=>s)[0] || null,
		neg_sfx: neg_sfx.filter(s=>s)[0] || null
	}
}


let parseRule = (l, group, defaultTest) => {
	let parts = l.split(R_S_SPLITTER)
	tags = parts[1].split("#")[0].trim()
	let r = parts[0].split("#")[0].trim().split(/\s/).filter(p => p)
	return {
		group,
		_from: r[0].trim(),
		_to: r[1].trim(),
		_test: (r[2]) ? { sfx: r[2].trim(), neg_sfx: null } :_.extend({}, defaultTest), 
		tags
	}
}
 


let loadAffix = filename => {
	let lines = fs.readFileSync(filename).toString().split(/[\r]*[\n]+/)
	let result = []
	let currentGroup
	let groupTest


	lines.forEach( l => {
		
		if( l.trim() == "" ) return
		
		if( LINE_COMMENT.test(l) ) return
		
		if ( GROUP.test(l) ) {
			currentGroup = l.split(" ")[1]
			return
		}
		
		if( GROUP_TEST.test(l)){
			groupTest = getGroupTest(l)
			return
		}
		
		result.push(getRecords(parseRule(l, currentGroup, groupTest)))
	})

	return _.flatten(result)
}


let result = [];

[
	"a.aff",                                                                                                                           
	"n1.aff",                                                                                                                          
	"n2.aff",                                                                                                                          
	"n2adj.aff",                                                                                                                       
	"n2n.aff",                                                                                                                         
	"n3.aff",                                                                                                                          
	"n4.aff",                                                                                                                          
	"np.aff",                                                                                                                          
	"numr.aff",                                                                                                                        
	"n_patr.aff",                                                                                                                      
	"v.aff",                                                                                                                           
	"vr.aff",                                                                                                                          
	"vr_advp.aff",                                                                                                                     
	"v_advp.aff",                                                                                                                      
	"v_impers.aff"
].forEach( filename => {
	console.log(`LOAD ${filename}`)
	result = result.concat(loadAffix(`../../data/affix/${filename}`))
	console.log(`ADD ${result.length} RECORDS`)
})               


fs.writeFileSync("./affix-uk.json", JSON.stringify(result, null," "))
console.log(`${result.length} records saved in affix-uk.json.`)









// [
// "adj:m:v_rod/v_zn1//n:v_rod",
// "adj:f:v_naz/v_kly",
// "adj:f:v_rod",
// "adj:f:v_zna:uncontr",
// "adj:n:v_naz/v_zna/v_kly:uncontr",
// "verb:pres:p:2"
// ].forEach( p => {
// 	console.log(p, " ==> ", getRecords("\\W\\w", "0" ,"#",p))	
// })



// console.log(lines.filter( l => LINE_COMMENT.test(l)))