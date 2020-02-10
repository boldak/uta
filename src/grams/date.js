let $ = require("../parser/rules")
let _ = require("lodash-node")

let N2 = $.all(
				
	$.token("INT"),
	
	$(data => {
		if (data.item && data.item.value) return data.item.value.length <= 2
	}),

	$(data => {
		let prev = data.prev()
		if (prev) return (prev.item.value != "" && prev.item.value != "-")
	}),

	$(data => {
		let next = data.next()
		if (next) return (next.item.value != "," && next.item.value != "-" &&  next.item.value != "%" &&  next.item.value != "$")
	})				

).then( d => d[0])
.then( d => ({
	value: d.item.value,
	mainForm: d.item.value,
	span: d.item.span
}))

let NUMBER_DAY = $.all(
	N2,
	$.valueRange(1, 31),
).then( d => ({
	value: d[0].value,
	mainForm: d[0].value,
	span: d[0].span
}))

let NUMBER_MONTH = $.all(
	N2,
	$.valueRange(1, 12)
).then( d => ({
	value: d[0].value,
	mainForm: d[0].value,
	span: d[0].span
}))

let NUMBER_FULL_YEAR = $.all(
	$.token("INT"),
	$.valueRange(1000, 2100)
).then( d => ({
	value: d[0].item.value,
	mainForm: d[0].item.value,
	span: d[0].item.span
}))

let NUMBER_SHORT_YEAR = $.all(
	N2,
	$( data => Number.parseInt(data.item.value) >= 0 && Number.parseInt(data.item.value) < 100 )
).then( d => ({
	value: (2000 + Number.parseInt(d[0].value))+"",
	mainForm: (2000 + Number.parseInt(d[0].value))+"",
	span: d[0].span
}))



let FULL_SHORT_YEAR = $.any(
	NUMBER_FULL_YEAR,
	NUMBER_SHORT_YEAR 
)

let NUMBER_YEAR = $.any(
	
	$.sequence(
		NUMBER_FULL_YEAR,
		$.mainForm("рік")
	).then( d => ({
		value: d[0].value,
		mainForm: d[0].value,
		span: {
			start: d[0].span.start,
			length: d[1].item.span.start + d[1].item.span.length - d[0].span.start
		}	
	})),

	
	
	$.sequence(
		NUMBER_FULL_YEAR,
		$.value("р"),
		$.value(".")
	).then( d => ({
		value: d[0].value,
		mainForm: d[0].value,
		span: {
			start: d[0].span.start,
			length: d[2].item.span.start + d[2].item.span.length - d[0].span.start
		}	
	})),
	
	NUMBER_FULL_YEAR
)	



let DATE_DELIMITER = $.any(
	$.value("."),
	// $.value("-"),
	$.value("/")
)

let YYYY_MM_DD = $.sequence(
	NUMBER_YEAR,
	DATE_DELIMITER,
	NUMBER_MONTH,
	DATE_DELIMITER,
	NUMBER_DAY
).then( d => ({
	token: "DATE",
	value:{
		year: d[0].value,
		month: d[2].value,
		day: d[4].value
	},
	mainForm:{
		year: d[0].value,
		month: d[2].value,
		day: d[4].value
	},
	span: {
		start: d[0].span.start,
		length: d[4].span.start + d[4].span.length - d[0].span.start
	}
}))

let DD_MM_YYYY = $.sequence(
	NUMBER_DAY,
	DATE_DELIMITER,
	NUMBER_MONTH,
	DATE_DELIMITER,
	NUMBER_YEAR
).then( d => ({
	token: "DATE",
	value:{
		year: d[4].value,
		month: d[2].value,
		day: d[0].value
	},
	mainForm:{
		year: d[4].value,
		month: d[2].value,
		day: d[0].value
	},
	span: {
		start: d[0].span.start,
		length: d[4].span.start + d[4].span.length - d[0].span.start
	}
}))

let MM_YYYY = $.sequence(
	NUMBER_MONTH,
	DATE_DELIMITER,
	NUMBER_YEAR
).then( d => ({
	token: "DATE",
	value:{
		year: d[2].value,
		month: d[0].value
	},
	mainForm:{
		year: d[2].value,
		month: d[0].value
	},
	span: {
		start: d[0].span.start,
		length: d[2].span.start + d[2].span.length - d[0].span.start
	}
}))

let YYYY = 
$.sequence(
	NUMBER_YEAR
)
	.then( d => ({
	token: "DATE",
	value:{
		year: d[0].value,
	},
	mainForm:{
		year: d[0].value,
	},
	span: d[0].span
}))

let monthMap = {
    'січень': "01",
    'лютий': "02",
    'березень': "03",
    'квітень': "04",
    'травень': "05",
    'червень': "06",
    'липень': "07",
    'серпень': "08",
    'вересень': "09",
    'жовтень': "10",
    'листопад': "11",
    'грудень': "12"
}

let WORD_MONTH = $.hasTag("s_date_month")
	.then( d => ({
		value: monthMap[d.item.interpretation[0].mainForm],
		mainForm: monthMap[d.item.interpretation[0].mainForm],
		span: d.item.span
}))

let WORD_DATE = $.any(
	$.sequence(
		NUMBER_DAY,
		WORD_MONTH,
		NUMBER_YEAR
	).then( d => {
		// console.log(d)
	return {
		token:"DATE",
		value:{
			year: d[2].value,
			month: d[1].value,
			day: d[0].value
		},
		mainForm:{
			year: d[2].mainForm,
			month: d[1].mainForm,
			day: d[0].mainForm
		},
		span:{
			start: d[0].span.start,
			length: d[2].span.start + d[2].span.length - d[0].span.start		
		}
	}
	}),

	$.sequence(
		NUMBER_DAY,
		// $.all(
			WORD_MONTH,
		// 	$.hasTag("v_rod")
		// ).then( d => d[0])
		// .then( d => {
		// 	console.log("NUMBER_DAY WORD_MONTH ",d.value)
		// 	return d
		// })
	).then( d =>({
		token:"DATE",
		value:{
			month:d[1].value,
			day: d[0].value
		},
		mainForm:{
			month: d[1].mainForm,
			day: d[0].mainForm
		},
		span:{
			start: d[0].span.start,
			length: d[1].span.start + d[1].span.length - d[0].span.start		
		}
	})),

	$.sequence(
		WORD_MONTH,
		NUMBER_YEAR
	).then( d =>({
		token:"DATE",
		value:{
			year: d[1].value,
			month: d[0].value 
		},
		mainForm:{
			year: d[1].mainForm,
			month: d[0].mainForm
		},
		span:{
			start: d[0].span.start,
			length: d[1].span.start + d[1].span.length - d[0].span.start		
		}
	})),

	$.sequence(
		WORD_MONTH
	).then(d => d[0])
	.then( d =>({
		token:"DATE",
		value:{
			month: d.value 
		},
		mainForm:{
			month: d.mainForm
		},
		span:d.span
	}))	
)

let NUMBERED_DATE = $.any(
	YYYY_MM_DD,
	DD_MM_YYYY,
	MM_YYYY,
	YYYY
)


let HOURS = $.all(
	N2,
	$.valueRange(0,23)
).then(d => d[0])

let MINUTES = $.all(
	N2,
	$.valueRange(0,59)
).then(d => d[0])

let SECONDS = $.all(
	N2,
	$.valueRange(0,59)
).then(d => d[0])

let TIME = $.any(
	$.sequence(
		HOURS,
		$.value(":"),
		MINUTES,
		$.value(":"),
		SECONDS,
	).then( d => ({
		value:{
			hh: d[0].value,
			mm: d[2].value,
			ss: d[4].value	
		},
		mainForm:{
			hh: d[0].value,
			mm: d[2].value,
			ss: d[4].value	
		},
		span:{
			start: d[0].span.start,
			length: d[4].span.start + d[4].span.length - d[0].span.start		
		}

	})),

	$.sequence(
		HOURS,
		$.value(":"),
		MINUTES
	)
	.then( d => ({
		value:{
			h: d[0].value,
			m: d[2].value	
		},
		mainForm:{
			h: d[0].value,
			m: d[2].value	
		},
		span:{
			start: d[0].span.start,
			length: d[2].span.start + d[2].span.length - d[0].span.start		
		}

	}))

	
).then( d => {
	d.token = "DATE"
	return d
})

let DATETIME = $.any(
	
	$.sequence(
		WORD_DATE,
		TIME	
	).then( d => ({
		value: _.extend(d[0].value, d[1].value),
		mainForm: _.extend(d[0].mainForm, d[1].mainForm),
		span:{
			start: d[0].span.start,
			length: d[1].span.start + d[1].span.length - d[0].span.start		
		}		
	})),
	
	$.sequence(
		NUMBERED_DATE,
		TIME	
	).then( d => ({
		value: _.extend(d[0].value, d[1].value),
		mainForm: _.extend(d[0].mainForm, d[1].mainForm),
		span:{
			start: d[0].span.start,
			length: d[1].span.start + d[1].span.length - d[0].span.start		
		}		
	}))

)

let DATE = $.any(
	// DATETIME,
	WORD_DATE,
	NUMBERED_DATE,
	TIME
)



module.exports = [
	DATE
]