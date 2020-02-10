let tokeize = require("../tokenizer")
let parse = require("../parser")


module.exports = (route, gramm, token) => ( 

{
	route,
	handler: (req, res) => {
		tokeize(req.body.text)
			.then( tokens => parse(tokens, require(gramm)))
			.then( r => {
				res.send(r.filter( d => d.token == token))
			})
			.catch( e => {
				res.send( `ONUK SERVICE EXCEPTION ${e.toString()}` )
			})
	}
})
