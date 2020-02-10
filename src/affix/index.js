let fs = require("fs")
let _ = require("lodash-node")
let generate = require("./util").generate

let affixes = JSON.parse(fs.readFileSync("./affix-uk.json").toString())


let getDefRules = (word, path) => {
	let parts = path.split(".")
	let main = parts[0]
	let subgroups = _.rest(parts)

	let inanimZna = (!/</.test(path) || />>/.test(path)) ? "/v_zna" : ""


	if(/n2adj1/.test(main)){
		if(/[еєо]$/.test(word)) return generate("noun:n:v_naz/v_kly"+inanimZna)
		if(/[ая]$/.test(word)) return generate("noun:f:v_naz/v_kly")
		if(/і$/.test(word)) return generate("noun:p:v_naz/v_kly")
		return generate("noun::m:v_naz/v_kly"+inanimZna)
	} 

	if(/n2adj2/.test(main)) return generate("noun::m:v_naz"+inanimZna)

	if(/n2n/.test(main)){
		if(/n2nm/.test(main)) return generate("noun:m:v_naz/v_kly"+inanimZna)
		if(/n2nf/.test(word)) return generate("noun:f:v_naz/v_zna/v_kly"+inanimZna)
		if(/.*(([бвгджзклмнпрстфхцчшщ])\2|\'|[джлртш]|рн)я$/.test(word)) return generate("noun:n:v_naz/v_rod/v_zna/v_kly//p:v_naz/v_kly")
		return generate("noun:n:v_naz/v_zna/v_kly")
	}		

	if(/n2/.test(main)) return generate("noun:m:v_naz")
	
	if(/n1/.test(main)) return generate("noun:f:v_naz")
	
	if(/n4/.test(main)) return generate("noun:n:v_naz/v_zna/v_kly")
	
	if(/n3/.test(main)) return generate("noun:f:v_naz/v_zna")

	if(/np/.test(main)) return generate("noun:p:v_naz/v_kly"+inanimZna)

	
	if(/numr/.test(main)){
		if(/ин$/.test(word)) return generate("numr:m:v_naz/v_zn2")
		return generate("numr:m:v_naz/v_zna")
	}

	if(/adj/.test(main)){
		if(/[еє]$/.test(word)) return generate("adj:n:v_naz/v_zna/v_kly")
		if(/[і]$/.test(word)) return generate("adj:p:v_naz/v_zn2/v_kly:ns")
		if(/[ая]$/.test(word)) return generate("adj:f:v_naz/v_kly")
		if(/[ії]й$/.test(word)) {
			if(/adj_pron/.test(main)) return generate("adj_pron::m:v_naz/v_zn2/v_kly")
			return generate("adj:m:v_naz/v_zn2/v_kly").concat( generate("adj:f:v_dav/v_mis")	)
		}	
				
		return generate("adj:m:v_naz/v_zn2/v_kly")
	}


	if(/vr/.test(main)) return generate("verb:rev:inf")
	if(/v/.test(main)) return generate("verb:inf")
	 

	 return []

}

let getRules = (word, path, addTags) => {
	let parts = path.split(".")
	let main = parts[0]
	let subgroups = _.rest(parts)

	let result = affixes.filter( r => r.group == main)
	subgroups.forEach( s => {
		result = result.concat(affixes.filter( r => r.group == `${main}.${s}`))
	})
	result = getDefRules(word, path).concat(result).map( r => {
		r.tags = (addTags) ? r.tags+":"+addTags : r.tags
		return r
	})
	return result
}


let apply = (word, path, addTags) => {
	let res = []
	getRules(word, path, addTags).forEach( r => {
		sfx = (r._test.sfx) ? new RegExp(`${r._test.sfx}$`) : { test: () => true}
		neg_sfx = (r._test.neg_sfx) ? new RegExp(`${r._test.neg_sfx}$`) : { test: () => false}
		if(sfx.test(word) && !neg_sfx.test(word)){
				res.push({
					word: (r._from == "0") ? word + r._to : word.replace(new RegExp(`${r._from}$`), r._to),
					mainForm: word,
					tags: r.tags,
					group: r.group
				})	
		}
	})
	return res
}


module.exports = apply



let tests = [
	{
		word:"Венедіктова",
		group:"n2adj1",
		tags:"l_name"
	},
	
	{
		word:"Дробович",
		group:"n20.a",
		tags:"l_name"
	},
	

]

tests.forEach( t => {
	console.log("==================================================")
	console.log(t.word, t.group, t.tags)
	let res = apply(t.word, t.group, t.tags).map( r => `${r.word}\t${r.mainForm}\t${r.tags}`).join("\n")
	console.log(res)
})

