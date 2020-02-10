let $ = require("../parser/rules")
let _ = require("lodash-node")

let cb = d => ({
	value: d.item.value,
	mainForm: (d.item.interpretation && d.item.interpretation[0]) ? d.item.interpretation[0].mainForm : d.item.value,
	span: d.item.span
})

let getSpan = d => ({
	start: d[0].span.start,
	length: d[d.length-1].span.start + d[d.length-1].span.length - d[0].span.start
})

let PART = $.any(

	$.sequence(
		$.token("LAT").then(cb),
		$.value("-").then(cb),
		$.token("LAT").then(cb)
	).then( d => ({
		value: d.map(v=>v.value).join(""),
		mainForm: d.map(v=>v.value).join(""),
		span:getSpan(d)
	})),

	$.token("LAT").then(cb)

)

let PROTOCOL = $.sequence (
		$.token("LAT").then(cb),
		$.value(":").then(cb),
		$.value("/").then(cb),
		$.value("/").then(cb)
).then( d => ({
	value: d.map(v=>v.value).join(""),
	mainForm: d.map(v=>v.value).join(""),
	span:getSpan(d)
}))

let D = 
	$.repeat(
		$.sequence(
			PART,
			$.value(".").then(cb)
		)
	)
	.then( d => _.flattenDeep(d))
	.then( d => ({
		value: d.map(v => v.value).join(""),
		mainForm: d.map(v => v.value).join(""),
		span:getSpan(d)
	}))
	

let DOMAIN = $.any(
	$.sequence(
		D,
		$.token("LAT").then(cb)
	).then( d => ({
		value: d.map(v=>v.value).join(""),
		mainForm: d.map(v=>v.value).join(""),
		span:getSpan(d)
	})),

	// $.all(
	// 	$.token("LAT").then(cb),
	// 	$.not($.capitalized)
	// ).then( d => d[0])
	
	
) 



let PORT = $.sequence(
	$.value(":").then(cb),
	$.token("INT").then(cb)
).then( d => ({
	value: d.map(v=>v.value).join(""),
	mainForm: d.map(v=>v.value).join(""),
	span:getSpan(d)
}))

let PATH = $.repeat(
	$.any(
		$.sequence(
			$.value("/").then(cb),
			$.token("LAT").then(cb)
		),
		$.value("/").then(cb)
	)
).then( d => _.flattenDeep(d))
.then( d => ({
	value: d.map(v=>v.value).join(""),
	mainForm: d.map(v=>v.value).join(""),
	span:getSpan(d)
}))

let URI = $.any(
	$.sequence(
		PROTOCOL,
		DOMAIN,
		PORT,
		PATH
	),

	$.sequence(
		DOMAIN,
		PORT,
		PATH
	),

	$.sequence(
		PROTOCOL,
		DOMAIN,
		PATH
	),

	$.sequence(
		PROTOCOL,
		DOMAIN,
		PORT
	),

	$.sequence(
		DOMAIN,
		PATH
	),

	$.sequence(
		DOMAIN,
		PORT
	),

	$.sequence(
		DOMAIN
	),

).then( d => ({
	token: "URI",
	value: d.map(v=>v.value).join(""),
	mainForm: d.map(v=>v.value).join(""),
	span:getSpan(d)
}))


module.exports = [
	// PROTOCOL,
	// PART,
	// D,
	// DOMAIN,
	URI
]