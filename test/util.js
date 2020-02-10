let _ = require("lodash-node")

module.exports = {
	toBeArray:(received, argument) => {
		return {
			pass: _.isArray(received),
			message: () => `expected ${received} ${(_.isArray(received)) ? "" : "not"} to be Array` 
		}
	}
}	