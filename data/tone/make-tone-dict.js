 let fs = require("fs")
 let count = 0
 let d = fs.readFileSync("./tone-dict-uk.tsv").toString().split("\r\n").map(r => {
 	let f = r.split("\t")
 	count++
 	return {
 		word: f[0],
 		tone: Number.parseInt(f[1])
 	}
 }).filter( r => r.tone )

fs.writeFileSync("./tone-dict-uk.json", JSON.stringify(d, null," "))
console.log(`${count} records save in tone-dict-uk.json.`)