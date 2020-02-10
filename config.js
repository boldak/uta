
let url = process.env.MONGOLAB_URI || process.env.MONGODB_URL || "mongodb://localhost:27017"
let mode = (process.env.NODE_ENV) ? process.env.NODE_ENV : "development"
let port = process.env.PORT || ((mode == "development") ? 8081 : 80) 

module.exports = {
	connection:{
		url,
		db: "nlp-uk",
		collection: "vesum",
		timeout: 10000
	},
	
	mode,
	port,
	publicDir:"./.public"
}