let fs = require("fs")
let Promise = require("bluebird")
const mongo = Promise.promisifyAll(require('mongodb').MongoClient)
const config = require("../config")

const url = config.connection.url

let mongoConnected = false
const connectionTimeout = config.connection.timeout
const tick = 100
let counter = 0

let elegantSpinner = require('elegant-spinner');
let logUpdate = require('log-update');
let chalk = require("chalk")
let frame = elegantSpinner();

let interval = setInterval(function () {
	if( mongoConnected ){
		clearInterval(interval)
	} else {
		if(counter < connectionTimeout) {
			logUpdate(`INSTALL VESUM > ${frame()} Try connect to ${url}`);
			counter += tick
		} else {
			logUpdate(chalk.red(`INSTALL VESUM > Connection failed ${url}`));
			process.exit()	
		}
	}
}, tick);


mongo.connect(url, {
		    useNewUrlParser: true,
		    useUnifiedTopology: true
		 })
		.then( client => {
			mongoConnected = true
		  	console.log(`INSTALL VESUM > Connect to ${url}`)
		  	const db = client.db(config.connection.db)
		  	const collection = db.collection(config.connection.collection)

		  	collection.findOne({})
		  		.then( res => {
		  			if( !res ){
		  				let counter = 0
			
						require("./async-queue")(
							i => {
								console.log(`INSTALL VESUM > Load vesum_part_${i}.json`)
								let vesum = JSON.parse(fs.readFileSync(`./data/vesum-tone/vesum_${i}.json`))
								let j = 0
								vesum.forEach( r => {
									delete r._id
									counter++
								})
								return collection.insertMany(vesum).then(() => {
									console.log(`INSTALL VESUM > ${counter} records inserted into collection`)
								})	
							}
						)
						.run(23)
						.then(() => {
							console.log("INSTALL VESUM > Create index")
							collection.createIndex("word")
							.then(() => {
								console.log(chalk.green("INSTALL VESUM > Complete"))
								client.close()	
							})
						})
		  			} else {
		  				console.log(chalk.yellow(`INSTALL VESUM > Vesum dictionary already exists. Skip operation.`))
		  				client.close()
		  			}
		  		})
		  		.catch( e => {
		  			console.log(`INSTALL VESUM > ${e.toString}`)		
		  		})

			
		})
		.catch( e => {
			console.log(`INSTALL VESUM > ${e.toString}`)
		})	

