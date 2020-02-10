const express = require("express");
const bodyParser = require("body-parser")
const cors = require("cors")
const config = require("./config")

// if (!process.env.NODE_ENV) {
//     process.env.NODE_ENV = "development"
// }
// const mode = process.env.NODE_ENV

console.log(`Starts UTA SERVICE in  ${config.mode} mode.`)

let app = express();
app.use(cors());
app.use(express.static(config.publicDir));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('*', function() {});

let routes = require("./src/routes")

routes.forEach( r => {
    app.post( r.route, r.handler)
})

let server = app.listen({ port: config.port }, function() {
    console.log(`UTA SERVICE ready at ${JSON.stringify(server.address())}`);
});

