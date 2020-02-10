let fs = require("fs")
let Promise = require("bluebird")
const mongo = Promise.promisifyAll(require('mongodb').MongoClient)
const url = 'mongodb://localhost:27017'
let _ = require("lodash-node")


mongo.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
 })
.then( client => {
  	const db = client.db('nlp-uk')
  	const collection = db.collection('vesum')

  	let files = [
  		// "position.dict.json",
  		// "geo.dict.json",
  		// "date.dict.json",
  		"position.dict.add.json"
  		
  		
  	]

  	let updated = 0
  	let skiped = 0
  	require("./async-queue")(
		i => {
			console.log(`INSTALL SEMANTIC > Load ${files[i]}`)
			let data = JSON.parse(fs.readFileSync(`../data/${files[i]}`))
			
			return Promise.all(
				data.map( d => {
					return new Promise( (resolve, reject) => {
						// console.log("> ", d.mainForm)
						collection.find({mainForm:d.mainForm}).toArray()
							.then( res  =>  {
								console.log(`INSTALL SEMANTIC > ${d.mainForm} : find ${res.length} records`)
								if( res.length > 0){
									res = res.map( r => {
									delete r._id
									r.tags = _.union(r.tags, d.tags)
									return r
								})
								collection.deleteMany({mainForm:d.mainForm})
									.then(()=>{
										
										collection.insertMany(res)
										.then(() => {
											updated += res.length
											console.log(`INSTALL SEMANTIC > ${updated} records updated`)
											resolve()	
										})
									})	
								} else {
									skiped++ 
									console.log(`INSTALL SEMANTIC > ${skiped} records skiped`)
									resolve()
								}
								
							})
					})
				})
			)
			.then( () => {
				// console.log(`INSTALL SEMANTIC > ${count} records updated`)
			})
		}
	)
	.run(0)
	.then ( () => {
		console.log("INSTALL SEMANTIC > Complete")
		client.close()
	})
})			
