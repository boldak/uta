let tokeize = require("../tokenizer")
let parse = require("../parser")
let $ = require("../parser/rules")
let _ = require("lodash-node")

module.exports = {
	route: "/ner/custom",
	handler: (req, res) => {
		tokeize(req.body.text)
			.then( tokens => parse(tokens, eval(req.body.rules)))
			.then( r => {
				res.send(r)
			})
			.catch( e => {
				res.send( `UTA SERVICE EXCEPTION ${e.toString()}` )
			})
	}
}