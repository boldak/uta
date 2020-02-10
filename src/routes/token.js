let tokeize = require("../tokenizer")
module.exports = {
	route: "/token",
	handler: (req, res) => {
		tokeize(req.body.text)
			.then(tokens => {
				res.send(tokens)
			})
			.catch( e => {
				res.error( e.toString())
			})
	}
}