let _ = require("lodash-node")
let tokenize = require("./tokenizer")
let parse = require("./parser")
let $ = require("./parser/rules")

let rules = `
[
	$.sequence(
		$.optional(
			$.any(
				$.value("+").then( d => "+"),
				$.value("-").then( d => "-"),
				$.repeat(
					$.value("№").then( d => "№")
				).then( d => d.join(""))
			)
		),
		$.token("INT").then( d => d.item.value),
		$.optional(
			$.sequence(
				$.any(
					$.value(".").then( d => "."),
					// $.value("-").then( d => "-")
				),
				$.token("INT").then( d => d.item.value)
			).then( d => d.join(""))
		),

		$.optional(
			$.value("%").then(d => "%")
		)
	).then( d => {
		console.log(d.filter( r => r).join(""))
	})
]
`
let text = `
1.2 +5 -23 0.333% 20-30 percents №323 №№674
`

tokenize(text)
	.then( tokens =>  parse(tokens, eval(rules)))
	.then(res => {
		console.log(res)
	})
