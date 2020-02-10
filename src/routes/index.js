let ner = require("./ner.js")
module.exports = [
	require("./token.js"),
	ner("/ner/persone","../grams/persone2.js","PERSONE"),
	ner("/ner/date","../grams/date.js","DATE"),
	ner("/ner/position","../grams/position.js","POSITION"),
	ner("/ner/geo","../grams/geo.js","GEO"),
	ner("/ner/uri","../grams/uri.js","URI"),
	ner("/ner/number","../grams/number.js","NUMBER"),
	require("./custom.js")

]