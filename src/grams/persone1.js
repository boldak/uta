let $ = require("../parser/rules")

let FNAME = $.all(
	$.hasTag("fname"),
	$.not($.hasTag("abbr")),
	$.not(
		$.all(
			$.mainForm("Рада"),
			$.prev(
				$.mainForm("верховний")
			)		
		)
	),
	$.not(
		$.value("Але"),
		$.not(
			$.next(
				$.token("PUNCT")
			)
		)
	)
).then( d => d[0])
.then( d => ({
	value: { fname: d.item.value },
	mainForm: { fname: d.item.interpretation[0].mainForm },
	span: d.item.span
}))

let PNAME =	$.all(
	$.hasTag("pname"),
	$.not($.hasTag("abbr"))
).then( d => d[0])
.then( d => ({
	value: { pname: d.item.value },
	mainForm: { pname: d.item.interpretation[0].mainForm },
	span: d.item.span
}))

let LNAME = $.any(
	
	$.all(
		$.hasTag("lname"),
		$.not($.hasTag("abbr")),
		$.not(
			$.any(
				$.all(	
					$.hasTag("adj"),
					$.sameGNC
				).then(d => d[0]),
				
				$.all(
					$.hasTag("noun"),
					$.next(
						$.not($.hasTag("prep")),
						$.hasTag("v_rod")
					)
				).then(d => d[0])
				
			)
		)
	).then(d => d[0])
	.then( d => ({
		value: { lname: d.item.value },
		mainForm:{ lname: d.item.interpretation[0].mainForm },
		span: d.item.span
	})),

	$.all(
		$.token("UK"),
		$.capitalized,
		$.any(
			$.prev(FNAME),
			$.prev(PNAME),
			$.prev($.value("."))
		)
	).then(d => d[0])
	.then( d => ({
		value: { lname: d.item.value },
		mainForm:{ lname: (d.item.interpretation && d.item.interpretation[0]) ? d.item.interpretation[0].mainForm : d.item.value},
		span: d.item.span
	})),
	
	
) 


let SHORT_FNAME_PNAME = $.sequence(
	$.all(
		$.token("UK"),
		$.capitalized,
		$(data => data.item.value.length == 1)
	).then( d => d[0]),
	$.value("."),
	$.all(
		$.token("UK"),
		$.capitalized,
		$(data => data.item.value.length == 1)
	).then( d => d[0]),
	$.value(".")	
)
.then( d => ({
	
	value: {
		fname: d[0].item.value+".",
		pname: d[2].item.value+"."
	},

	mainForm: {
		fname: d[0].item.value+".",
		pname: d[2].item.value+"."
	},

	span: {
		start: d[0].item.span.start,
		length: d[3].item.span.start + d[3].item.span.length - d[0].item.span.start
	}

}))

let SHORT_FNAME = $.sequence(
	$.all(
		$.token("UK"),
		$.capitalized,
		$(data => data.item.value.length == 1)
	).then(d => d[0]),
	$.value(".")	
).then( d => ({
	value: { fname: d[0].item.value+"." },
	mainForm: { fname: d[0].item.value+"." },

	span: {
		start: d[0].item.span.start,
		length: d[1].item.span.start + d[1].item.span.length - d[0].item.span.start
	}

}))

let FNAME_PNAME_LNAME = $.all(
					
	$.sequence(	FNAME, PNAME, LNAME ),
		
	$.sequence(
		$.sameGNC,
		$.sameGNC
	)

).then( d => d[0])
.then( d => {
	return {
		value: {
			fname: d[0].value.fname,
			pname: d[1].value.pname,
			lname: d[2].value.lname
		},
		mainForm: {
			fname: d[0].mainForm.fname,
			pname: d[1].mainForm.pname,
			lname: d[2].mainForm.lname
		},

		span: {
			start: d[0].span.start,
			length: d[2].span.start + d[2].span.length - d[0].span.start
		}
	}		
})

let LNAME_FNAME_PNAME = $.all(  			
	$.sequence( LNAME, FNAME, PNAME ),
	
	$.sequence(
		$.sameGNC,
		$.sameGNC
	)

).then( d => d[0])
.then( d => {
	return {
		value: {
			fname: d[1].value.fname,
			pname: d[2].value.pname,
			lname: d[0].value.lname
		},
		mainForm: {
			fname: d[1].mainForm.fname,
			pname: d[2].mainForm.pname,
			lname: d[0].mainForm.lname	
		},

		span: {
			start: d[0].span.start,
			length: d[2].span.start + d[2].span.length - d[0].span.start
		}	
	}	
})

let FNAME_PNAME = $.all( 
	$.sequence( FNAME, PNAME),
	$.sameGNC
).then( d => d[0])
.then( d => {
	return {
		value: {
			fname: d[0].value.fname,
			pname: d[1].value.pname
		},
		mainForm:{
			fname: d[0].mainForm.fname,
			pname: d[1].mainForm.pname	
		},

		span: {
			start: d[0].span.start,
			length: d[1].span.start + d[1].span.length - d[0].span.start
		}	
	}	
})

let PNAME_FNAME = $.all( 
	$.sequence( PNAME, FNAME ),
	$.sameGNC
).then(d => d[0])
.then( d => {
	return {
		value: {
			fname: d[1].value.fname,
			pname: d[0].value.pname
		},
		mainForm: {
			fname: d[1].mainForm.fname,
			pname: d[0].mainForm.pname	
		},

		span: {
			start: d[0].span.start,
			length: d[1].span.start + d[1].span.length - d[0].span.start
		}
	}	
})

let FNAME_LNAME = $.all( 
	$.sequence( FNAME, LNAME)
	// ,
	// $.sameGNC
).then( d => d[0])
.then( d => {
	return {
		value: {
			fname: d[0].value.fname,
			lname: d[1].value.lname
		},
		mainForm: {
			fname: d[0].mainForm.fname,
			lname: d[1].mainForm.lname
		},

		span: {
			start: d[0].span.start,
			length: d[1].span.start + d[1].span.length - d[0].span.start
		}	
	}	
})

let LNAME_FNAME = $.all( 
	$.sequence( LNAME, FNAME),
	$.sameGNC
).then( d => d[0])
.then( d => {
	return {
		value:{
			fname: d[1].value,
			lname: d[0].value
		},
		mainForm:{
			fname: d[1].mainForm,
			lname: d[0].mainForm	
		},

		span: {
			start: d[0].span.start,
			length: d[1].span.start + d[1].span.length - d[0].span.start
		}	
	}	
})

let SHORT_FNAME_PNAME_LNAME = $.sequence( SHORT_FNAME_PNAME, LNAME)
	.then( d => {
		return {
			value:{
				fname: d[0].value.fname,
				pname: d[0].value.pname,
				lname: d[1].value.lname
			},
			mainForm:{
				fname: d[0].mainForm.fname,
				pname: d[0].mainForm.pname,
				lname: d[1].mainForm.lname	
			},

			span: {
				start: d[0].span.start,
				length: d[1].span.start + d[1].span.length - d[0].span.start
			}	
		}	
	})

let LNAME_SHORT_FNAME_PNAME = $.sequence( LNAME, SHORT_FNAME_PNAME)
	.then( d => {
		return {
			value:{
				fname: d[1].value.fname,
				pname: d[1].value.pname,
				lname: d[0].value.lname
			},
			mainForm:{
				fname: d[1].mainForm.fname,
				pname: d[1].mainForm.pname,
				lname: d[0].mainForm.lname	
			},

			span: {
				start: d[0].span.start,
				length: d[1].span.start + d[1].span.length - d[0].span.start
			}	
		}	
	})

let LNAME_SHORT_FNAME = $.sequence( LNAME, SHORT_FNAME)
	.then( d => {
		return {
			value:{
				fname: d[1].value.fname,
				lname: d[0].value.lname
			},
			mainForm:{
				fname: d[1].mainForm.fname,
				lname: d[0].mainForm.lname	
			},

			span: {
				start: d[0].span.start,
				length: d[1].span.start + d[1].span.length - d[0].span.start
			}	
		}	
	})

let SHORT_FNAME_LNAME = $.sequence( SHORT_FNAME, LNAME)
	.then( d => {
		return {
			value:{
				fname: d[0].value.fname,
				lname: d[1].value.lname
			},
			mainForm:{
				fname: d[0].mainForm.fname,
				lname: d[1].mainForm.lname	
			},

			span: {
				start: d[0].span.start,
				length: d[1].span.start + d[1].span.length - d[0].span.start
			}	
		}	
	})


let PERSONE = $.any(
	// SHORT_FNAME_PNAME
	FNAME_PNAME_LNAME,
	LNAME_FNAME_PNAME,
	SHORT_FNAME_PNAME_LNAME,
	LNAME_SHORT_FNAME_PNAME,
	FNAME_LNAME,
	LNAME_FNAME,
	FNAME_PNAME,
	SHORT_FNAME_LNAME,
	LNAME_SHORT_FNAME,
	FNAME,
	LNAME
).then( d => {
	d.token = "PERSONE"
	return d 
})

module.exports = [
	PERSONE
] 

