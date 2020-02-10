let tokeize = require("../tokenizer")
let parse = require("../parser")


module.exports = {
	route: "/ner/persone",
	handler: (req, res) => {
		tokeize(req.body.text)
			.then( tokens => parse(tokens, require("../grams/persone1.js")))
			.then( r => {
				res.send(r.filter( d => d.token == "PERSONE"))
			})
			.catch( e => {
				res.send( `ONUK SERVICE EXCEPTION ${e.toString()}` )
			})
	}
}