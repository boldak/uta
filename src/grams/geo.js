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



let ADJECTIVE_TAG = $.hasTag("adj").then( cb )

let GENITIVE_TAG = $.hasTag("v_rod").then( cb )

let OBL = $.sequence(
	$.value("обл").then( cb ),
	$.value(".").then( cb )
).then( d => ({
	value: "обл.",
	mainForm: "обл.",
	span: getSpan(d)
}))

let R_N = $.any(
	$.value("р-н").then( cb ),
	$.value("р-на").then( cb ),
	$.value("р-ном").then( cb ),
	$.value("р-ну").then( cb ),
	$.value("р-ні").then( cb )
)

let REGION = $.sequence(
	ADJECTIVE_TAG,
	$.any(
		$.hasTag("s_geo_region").then( cb ),
		OBL,
		R_N
	)
)
.then( d => ({
	value: d.map( v => v.value).join(" "),
	mainForm: d.map( v => v.mainForm).join(" "),
	span: getSpan(d)
}))


let AO = $.any(
	$.sequence(
		$.mainForm("автономний").then( cb ), 
		$.mainForm("округ").then( cb )
	).then( d => ({
		value: `${d[0].value} ${d[1].value}`,
		mainForm: `${d[0].mainForm} ${d[1].mainForm}`,
		span: getSpan(d)
	})),
	$.mainForm("округ").then( cb ),
	$.value("АО").then( cb )
)

let AUTONOMOUS_DISTRICT = $.sequence(
	$.repeat(ADJECTIVE_TAG),
	AO	
)
.then( d => _.flattenDeep(d))
.then( d => ({
	value: d.map(v => v.value).join(" "),
	mainForm: d.map(v => v.value).join(" "),
	span: getSpan(d)
})) 

let FEDERATION = $.any(
	
	$.sequence(
		$.repeat(ADJECTIVE_TAG),
		$.hasTag("s_geo_federation").then( cb ),
		$.repeat($.hasTag("geo").then( cb ))
	)
	.then( d => _.flattenDeep(d))
	.then( d => ({
		value: d.map(v => v.value).join(" "),
		mainForm: d.map(v => v.value).join(" "),
		span: getSpan(d)
	})),

	$.sequence(
		$.hasTag("s_geo_federation").then( cb ),
		$.repeat($.any(
			$.hasTag("geo").then( cb ),
			$.mainForm("острів").then( cb ),
			$.mainForm("земля").then( cb ),
		))
	)
	.then( d => [d[0]].concat(d[1]))
	.then( d => ({
		value: d.map(v => v.value).join(" "),
		mainForm: d.map(v => v.value).join(" "),
		span: getSpan(d)
	})),

	$.sequence(
		$.repeat(ADJECTIVE_TAG),
		$.hasTag("s_geo_federation").then( cb ),
	)
	.then( d => d[0].concat(d[1]))
	.then( d => ({
		value: d.map(v => v.value).join(" "),
		mainForm: d.map(v => v.value).join(" "),
		span: getSpan(d)
	}))

)

let ADJX_FEDERATION = $.any(
	
	$.sequence(
		$.repeat($.hasTag("adj").then( cb )),
		$.hasTag("s_geo_adj_federation").then( cb ),
		$.repeat(GENITIVE_TAG)
	)
	.then( d => _.flattenDeep(d))
	.then( d => { 
		return {
			value: d.map(v => v.value).join(" "),
			mainForm: d.map(v => v.value).join(" "),
			span: getSpan(d)
		}
	}),

	$.sequence(
		$.repeat($.hasTag("adj").then( cb )),
		$.hasTag("s_geo_adj_federation").then( cb ),
	)
	.then( d => _.flattenDeep(d))
	.then( d => ({
		value: d.map(v => v.value).join(" "),
		mainForm: d.map(v => v.value).join(" "),
		span: getSpan(d)
	}))
)

let STATE = $.any(
	$.sequence(
		$.any(
			$.mainForm("графство").then( cb ), 
			$.mainForm("штат").then( cb ),
			$.mainForm("королівство").then( cb )
		),
		ADJECTIVE_TAG,
		$.hasTag("geo").then( cb )
		// $.hasTag("noun")
	).then( d => ({
		value: d.map(v => v.value).join(" "),
		mainForm: d.map(v => v.value).join(" "),
		span: getSpan(d)
	})),

	$.sequence(
		$.any(
			$.mainForm("графство").then( cb ), 
			$.mainForm("штат").then( cb ),
			$.mainForm("королівство").then( cb )
		),
		$.hasTag("geo").then( cb )
		// $.hasTag("noun")
	).then( d => ({
		value: d.map(v => v.value).join(" "),
		mainForm: d.map(v => v.value).join(" "),
		span: getSpan(d)
	}))
)


let SMT = $.sequence(
			$.value("с").then( cb ),
			$.value("."),
			$.value("м"),
			$.value("."),
			$.value("т"),
			$.value(".")
		).then( d =>({
			value: "с.м.т.",
			mainForm: "с.м.т.",
			span: {
				start: d[0].span.start,
				length: 6
			}
		})) 


let M = $.sequence(
			$.value("м").then( cb ),
			$.value("."),
		)
		.then( d =>({
			value: "м.",
			mainForm: "м.",
			span: {
				start: d[0].span.start,
				length: 2
			}
		})) 

let S = $.sequence(
			$.value("с").then( cb ),
			$.value("."),
		)
		.then( d =>({
			value: "с.",
			mainForm: "с.",
			span: {
				start: d[0].span.start,
				length: 2
			}
		})) 
				

let L1 = $.any(
		$.mainForm("місто").then( cb ),
		$.mainForm("село").then( cb ),
		$.mainForm("селище").then( cb ),
		SMT,
		S,
		M
)

let L2 = $.all(
	$.hasTag("geo").then( cb ),
	$.not(
		$.hasAnyTag("abbr", "prep", "conj", "part","lname","fname","pname")
	),
	$( data => {
		let next = data.next()
		if( next ) return next.item.value != ":"
	}),
	$.not(
		$.any(
			$.all(	
				$.hasTag("adj"),
				$.sameGNC
			).then(d => d[0]),
			$.all(
				$.hasTag("noun"),
				$.next(
					$.hasTag("v_rod")
				)
			).then(d => d[0])
		)
	)
).then( d => d[0]) 

let SINGLE_LOCALITY = $.any(
	
	$.sequence(
		L1,
		ADJECTIVE_TAG,
		L2
	).then( d => ({
		value: d.map(v => v.value).join(" "),
		mainForm: d.map(v => v.value).join(" "),
		span: getSpan(d)
	})),

	$.sequence(
		L1,
		L2
	).then( d => ({
		value: d.map(v => v.value).join(" "),
		mainForm: d.map(v => v.value).join(" "),
		span: getSpan(d)
	})),

	$.sequence(
		ADJECTIVE_TAG,
		L2
	).then( d => ({
		value: d.map(v => v.value).join(" "),
		mainForm: d.map(v => v.value).join(" "),
		span: getSpan(d)
	})),

	$.sequence(
		L2
	).then( d => ({
		value: d.map(v => v.value).join(" "),
		mainForm: d.map(v => v.value).join(" "),
		span:getSpan(d)
	}))
)

let LOCALITY = $.any(
	$.sequence(
		$.repeat(SINGLE_LOCALITY),
		$.repeat(REGION)
	),

	$.repeat(SINGLE_LOCALITY)
)
.then( d => _.flattenDeep(d))
.then( d => ({
		value: d.map(v => v.value).join(" "),
		mainForm: d.map(v => v.value).join(" "),
		span: getSpan(d)
	}))

let LOCATION = $.any(
	REGION,
    AUTONOMOUS_DISTRICT,
    FEDERATION,
    ADJX_FEDERATION,
    STATE,
    LOCALITY
).then( d => {
	d.token = "GEO"
	d.mainForm = {
		location: d.mainForm 
	}
	return d
})


module.exports = [ 
	LOCATION 
]