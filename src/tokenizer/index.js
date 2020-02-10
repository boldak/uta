
let Promise = require("bluebird")
const mongo = Promise.promisifyAll(require('mongodb').MongoClient)
let lexr = require('./token/tokenizer.js')
let _ = require("lodash-node")

const config = require("../../config")
const url = config.connection.url

/**
 * Токенайзер текстів на українській мові.
 * Перетворює вхідний рядок в масив токенів UK, LAT, INT, PUNCT, EOL, OTHER. Ігнорує всі пробіли.
 * @module tokenizer
 */

/**
 * Повертає масив токенів, збагачених vesum-інтерпретацією
 * @param {string} input - Вхідний рядок.
 * @return {Promise} Проміс, який буде повертати масив токенів.
 */

module.exports = input => {

	let tokenizer = new lexr("");

	tokenizer.addTokenSet(require("./tokens"));
	tokenizer.ignoreWhiteSpace();
	tokenizer.ignoreNewLine();

	let output = tokenizer.tokenize(input).map( o => ({
		token: (o.token == "UK1") ? "UK" : o.token,
		value: o.value.replace("’","'"),
		span:{
			start:o.start,
			length:o.value.length
		}
	}));

	return new Promise((resolve, reject) => {
			mongo.connect(url, {
		    useNewUrlParser: true,
		    useUnifiedTopology: true
		 })
		.then( client => {
		  	const db = client.db(config.connection.db)
		  	const collection = db.collection(config.connection.collection)
		  	Promise.all(
		  		output.map( (o, index) => (o.token == "UK")  
			  		? Promise.all([
			  			collection.find({word:o.value/*.toLowerCase()*/}).toArray().then( items => items),
			  			collection.find({word:o.value.toLowerCase()}).toArray().then( items => items)
			  			]
			  		  ).then( res => {
			  		  	o.interpretation = _.flatten(res).map( item => ({
			  		  		word: item.word,
			  		  		mainForm: item.mainForm,
			  		  		tags: _.zipObject(item.tags,_.fill(Array(item.tags.length), true)),
			  		  		tone: item.tone || 0
			  		  	}))
			  		  })		
				  	: new Promise(resolve => {resolve()})	
		  		)
		  	).then( () => {
		  		client.close()
		  		output = output.map( o => {
		  			o.tone = (o.interpretation && o.interpretation[0]) ? o.interpretation[0].tone : 0
		  			return o
		  		})
		  		resolve(output)
		  	})	
		 })	
	})
}

