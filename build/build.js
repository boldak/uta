let fs = require("fs-extra")

fs.copySync(
	"./assets/", 
	"./.public/", 
	{ overwrite: true }
)