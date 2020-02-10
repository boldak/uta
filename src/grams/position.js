let $ = require("../parser/rules")
let _ = require("lodash-node")

let MAIN_POSITION = $.any(

		$.sequence(
			$.mainForm("уповноважений"),
			$.any(
				$.value("у"),
				$.value("в")
			),
			$.hasTag("v_mis")
		).then(d => ({
			token: "MAIN_POSITION",
			value: {
				position: d.map( v => v.item.value).join(" ")
			},
			mainForm: {
				position: d[0].item.interpretation[0].mainForm +" "+d[1].item.value+" "+d[2].item.value
			},
			span:{
				start: d[0].item.span.start,
				length: d[2].item.span.start + d[2].item.span.length - d[0].item.span.start
			}	
		})),

		$.sequence(
			$.any(
				$.value("прем'єр"),
				$.value("екс"),
				$.value("віце"),
				$.value("прес"),
				$.value("статс"),
				$.value("генерал"),
				$.value("обер")	
			),
			$.value("-"),
			$.any(
				$.mainForm("президент"),
				$.mainForm("прокурор"),
				$.mainForm("фельдцейхмейстер"),
				$.mainForm("консул"),
				$.mainForm("мер"),
				$.mainForm("губернатор"),
				$.mainForm("лейтенант"),
				$.mainForm("майор"),
				$.mainForm("полковник"),
				$.mainForm("аташе"),
				$.mainForm("голова"),
				$.mainForm("секретар"),
				$.mainForm("спікер"),
				$.mainForm("прем'єр"),
				$.mainForm("міністр"),
			)
			
		).then(d => ({
			token: "MAIN_POSITION",
			value: {
				position: d.map( v => v.item.value).join("")
			},
			mainForm: {
				position: d[0].item.value +d[1].item.value+d[2].item.interpretation[0].mainForm
			},
			span:{
				start: d[0].item.span.start,
				length: d[2].item.span.start + d[2].item.span.length - d[0].item.span.start
			}	
		})),

		$.sequence(
			$.hasTag("adj", "m", "&numr")
				.then( d => {
					d.item.mainForm = _.find(d.item.interpretation, 
							i => ["adj", "m", "&numr"]
								.map( t => i.tags[t])
								.filter( t => t).length == 3
					).mainForm
					return d
				}),
			$.any(
				$.mainForm("заступник"),
				$.mainForm("зам")
			),
			$.hasTag("s_pos","v_rod")
		).then(d => ({
			token: "MAIN_POSITION",
			value: {
				position: d.map( v => v.item.value).join(" ")
			},
			mainForm: {
				position: d[0].item.mainForm +" "+d[1].item.interpretation[0].mainForm +" "+d[2].item.value
			},
			span:{
				start: d[0].item.span.start,
				length: d[2].item.span.start + d[2].item.span.length - d[0].item.span.start
			}	
		})),

		$.sequence(
			$.any(
				$.mainForm("заступник"),
				$.mainForm("зам")
			),
			$.hasTag("s_pos","v_rod")
		).then(d => ({
			token: "MAIN_POSITION",
			value: {
				position: d.map( v => v.item.value).join(" ")
			},
			mainForm: {
				position: d[0].item.interpretation[0].mainForm +" "+d[1].item.value
			},
			span:{
				start: d[0].item.span.start,
				length: d[1].item.span.start + d[1].item.span.length - d[0].item.span.start
			}	
		})),

		$.sequence(
			$.any(
				$.mainForm("кандидат"),
				$.mainForm("кандидатура"),
				$.mainForm("кандидатка")
			),
			$.any(
				$.value("в"),
				$.value("у")
			),
			$.hasTag("p")
		).then(d => ({
			token: "MAIN_POSITION",
			value: {
				position: d.map( v => v.item.value).join(" ")
			},
			mainForm: {
				position: d[0].item.interpretation[0].mainForm +" " +d[1].item.value+" " +d[2].item.value
			},
			span:{
				start: d[0].item.span.start,
				length: d[2].item.span.start + d[2].item.span.length - d[0].item.span.start
			}	
		})),

		$.sequence(
			$.any(
				$.mainForm("кандидат"),
				$.mainForm("кандидатура"),
				$.mainForm("кандидатка")
			),
			$.value("на"),
			$.hasTag("v_zna")
		).then(d => ({
			token: "MAIN_POSITION",
			value: {
				position: d.map( v => v.item.value).join(" ")
			},
			mainForm: {
				position: d[0].item.interpretation[0].mainForm +" " +d[1].item.value+" " +d[2].item.value
			},
			span:{
				start: d[0].item.span.start,
				length: d[2].item.span.start + d[2].item.span.length - d[0].item.span.start
			}	
		})),
		
		$.sequence(
			$.hasTag("adv"),
			$.mainForm("виконуючий"),
			$.hasTag("v_naz"),
			$.hasTag("v_rod")
		).then(d => ({
			token: "MAIN_POSITION",
			value: {
				position: d.map( v => v.item.value).join(" ")
			},
			mainForm: {
				position: d[0].item.value +" "+d[1].item.interpretation[0].mainForm +" " +d[2].item.value+" " +d[3].item.value
			},
			span:{
				start: d[0].item.span.start,
				length: d[3].item.span.start + d[3].item.span.length - d[0].item.span.start
			}	
		})),

		$.sequence(
			$.mainForm("виконуючий"),
			$.hasTag("v_naz"),
			$.hasTag("v_rod")
		).then(d => ({
			token: "MAIN_POSITION",
			value: {
				position: d.map( v => v.item.value).join(" ")
			},
			mainForm: {
				position: d[0].item.interpretation[0].mainForm +" " +d[1].item.value+" " +d[2].item.value
			},
			span:{
				start: d[0].item.span.start,
				length: d[2].item.span.start + d[2].item.span.length - d[0].item.span.start
			}	
		})),
		
		$.hasTag("s_pos")
		.then( d => ({
			token: "MAIN_POSITION",
			value: {
				position: d.item.value
			},
			mainForm: {
				position: d.item.interpretation[0].mainForm
			},
			span: d.item.span	
		}))
		
) 

let AWHERE = $.all(
	$.hasTag("v_rod"),
	$.any(
		$.mainForm("рада"),
		$.not(
			$.all(
				$.hasAnyTag("fname","lname"),
				// $.not($.hasTag("abbr"))
			)
		)
	)
	
).then( d => d[0])

let ABBR = $.any(
	$.hasTag("abbr"),
	$(data => (_.isString(data.item.value)) ? data.item.value.toUpperCase() == data.item.value && data.item.value.length > 1 : false)
	// .then(d => {
	// 	console.log(d.item)
	// 	return d
	// }) //data.item.value.toUpperCase() == data.item.value)
)

let WHERE = $.any(
	$.value("з"),
	$.value("із"),
	AWHERE,
	// ABBR
)

let W = $.sequence(
	MAIN_POSITION,
	$.repeat(WHERE)
).then( d => ({
	token: "POSITION",
	value: {
		position: d[0].value.position+" "+ d[1].map(d => d.item.value).join(" ")
	},
	mainForm: {
		position: d[0].mainForm.position+" "+ d[1].map(d => d.item.value).join(" ")
	},
	span:{
		start: d[0].span.start,
		length: d[1][d[1].length-1].item.span.start + d[1][d[1].length-1].item.span.length - d[0].span.start
	}
}))

let MM = $.repeat(
	$.token("POSITION")
).then( d => ({
	token: "POSITION",
	value: {
		position: d.map( v => v.value)
	},	
	mainform: {
		position: d.map( v => v.mainForm) 
	},
	span:{
		start: d[0].span.start,
		length: d[d.length-1].span.start + d[d.length-1].span.length - d[0].span.start
	}
}))	

let MAIN_POSITION_ONLY = $.token("MAIN_POSITION")
.then( d =>{
	d.token = "POSITION"
	d.value = d.item.value
	return {
		token:"POSITION",
		value: d.item.value,
		mainForm: d.item.mainForm,
		span: d.item.span
	}
})

let APOSITION = $.any(
	W,
	MAIN_POSITION,
	MAIN_POSITION_ONLY
)

module.exports = [
	APOSITION
]