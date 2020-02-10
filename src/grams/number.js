let $ = require("../parser/rules")
let _ = require("lodash-node")
let DATE = require("./date")[0]

let cb = d => ({
	value: d.item.value,
	mainForm: d.item.value,
	span: d.item.span
})

let getSpan = d => {

	if(_.isArray(d)) {
		return {
			start: d[0].span.start,
			length: d[d.length-1].span.start + d[d.length-1].span.length - d[0].span.start
		}
	} else {
		return d.span
	} 	
} 


let T = $.any(
	$.all(
		$.token("INT"),
		$.next($.value(":")),
		$.next($.next($.token("INT")))
	),
	$.all(
		$.token("INT"),
		$.prev($.value(":")),
		$.prev($.prev($.token("INT")))
	)
) 


let N = $.sequence(
	$.optional(
		$.value("-").then(cb)
	),	
	$.token("INT").then(cb),
	$.optional(
		$.sequence(
			$.any(
				$.value(".").then(cb),
				$.value(",").then(cb)
			),
			$.token("INT").then(cb)
		).then(d => ({
			value: d.map( r => r.value).join(""),
			mainForm: d.map( r => r.value).join(""),
			span: getSpan(d)
		}))
	)
).then( d => ({
	token:"NUMBER",
	type:"qty",
	value: ((d[0]) ? d[0].value : "") + d[1].value + ((d[2]) ? d[2].value : ""),
	mainForm: ((d[0]) ? d[0].value : "") + d[1].value + ((d[2]) ? d[2].value : ""),
	span: getSpan(d.filter( r => r ))
}))

let QUANTITY = $.all(
	N,
	$.not(T)
).then(d => d[0])

let INTERVAL = $.sequence(
	QUANTITY,
	$.value("-").then(cb),
	QUANTITY
).then(d => ({
	token:"NUMBER",
	type:"interval",
	value: [d[0].value, d[2].value],
	mainForm: [d[0].value, d[2].value],
	span: getSpan(d)
}))

let ID = $.sequence(
	$.repeat(
		$.value("№").then(cb)
	),
	$.token("INT").then(cb),
	$.optional(
		$.sequence(
			$.any(
				$.value("-").then(cb),
				$.value("/").then(cb),
				$.value(".").then(cb),
				// $.value(":").then(cb),
			),
			$.token("INT").then(cb)
		)
	)
).then( d => {
	d = _.flattenDeep(d.filter(r => r))
	return {
		token:"NUMBER",
		type:"id",
		value: d.filter( r => r.value != "№" ).map(r => r.value).join(""),
		mainForm: d.filter( r => r.value != "№" ).map(r => r.value).join(""),
		span: getSpan(d)	
	}
})

let PERCENT = $.sequence(
	QUANTITY,
	$.value("%").then(cb)
).then(d => ({
	token:"NUMBER",
	type:"percent",
	value: d[0].value,
	mainForm: d[0].mainForm,
	span: getSpan(d)	
}))


let NUMBERS = $.all(
	$.any(
		ID,
		INTERVAL,
		PERCENT,
		QUANTITY
	),
	$.not(DATE)
).then(d => d[0])
.then( d => ({
	token:"NUMBER",
	value: d.value,
	mainForm: {
		type: d.type,
		value: d.mainForm
	},
	span: d.span
}))

module.exports = [NUMBERS]