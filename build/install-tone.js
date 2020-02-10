// let fs = require("fs")
// let Promise = require("bluebird")
// const mongo = Promise.promisifyAll(require('mongodb').MongoClient)
// const url = 'mongodb://localhost:27017'

// mongo.connect(url, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//  })
// .then( client => {
//   	const db = client.db('nlp-uk')
//   	const collection = db.collection('tone')

//   	collection.findOne({})
//   		.then( res => {
//   			if( !res ){
  				
// 				console.log(`INSTALL TONE > Load tone-dict-uk.json`)
// 				let tones = JSON.parse(fs.readFileSync(`../data/tone/tone-dict-uk.json`))
// 				collection.insertMany(tones).then(() => {
// 					console.log(`INSTALL TONE > ${tones.length} records inserted into collection "tone"`)
// 					console.log("INSTALL TONE > Create index")
// 					collection.createIndex("word")
// 					.then(() => {
// 						console.log("INSTALL TONE > Complete")
// 						client.close()	
// 					})
// 				})	
// 			} else {
//   				console.log(`INSTALL TONE > Tone dictionary already exists. Skip operation.`)
//   				client.close()
//   			}
//   		})

// })	


let fs = require("fs")
let Promise = require("bluebird")
const mongo = Promise.promisifyAll(require('mongodb').MongoClient)
const url = 'mongodb://localhost:27017'
let _ = require("lodash-node")


// let data = JSON.parse(fs.readFileSync(`../data/tone/tone-dict-uk.json`))

// console.log(_.findIndex(data, d => d.word == "повальний"))

mongo.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
 })
.then( client => {
  	const db = client.db('nlp-uk')
  	const collection = db.collection('vesum')

  	// let files = [
  	// 	// "position.dict.json",
  	// 	// "geo.dict.json",
  	// 	// "date.dict.json",
  	// 	"position.dict.add.json"
  		
  		
  	// ]

  	let updated = 0
  	let skiped = 0
	console.log(`INSTALL TONE > Load tone-dict-uk.json`)
	let data = JSON.parse(fs.readFileSync(`../data/tone/tone-dict-uk.json`))

  	require("./async-queue")(
		i => new Promise( (resolve, reject) => {
			if(i < 2370){
				console.log(`SKIP ${data[i].word}`)
				resolve()
				return
			}
			let d = data[i]
			collection.find({mainForm:d.word}).toArray()
				.then( res  =>  {
					console.log(`INSTALL TONE > ${d.word} : find ${res.length} records`)
					if( res.length > 0){
						res = res.map( r => {
						r.tone = d.tone 
						delete r._id
						// r.tags = _.union(r.tags, d.tags)
						return r
					})
					collection.deleteMany({mainForm:d.word})
						.then(()=>{
							
							collection.insertMany(res)
							.then(() => {
								updated += res.length
								console.log(`INSTALL TONE > ${updated} records updated`)
								resolve()	
							})
						})	
					} else {
						skiped++ 
						console.log(`INSTALL TONE > ${skiped} records skiped`)
						resolve()
					}
					
				})
		})
	)
	.run(data.length-1)
	.then ( () => {
		console.log("INSTALL TONE > Complete")
		client.close()
	})
})			
