let $ = require("../parser/rules")
let _ = require("lodash-node")

//---------------------- UTILS ----------------------------------- 

let cb = d => ({
	value: d.item.value,
	mainForm: (d.item.interpretation && d.item.interpretation[0]) ? d.item.interpretation[0].mainForm : d.item.value,
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


//----------------------- RULES -----------------------------------


let INITIAL = $.sequence(
	$.all(
		$.token("UK").then(cb),
		$.capitalized,
		$(data => data.item.value.length == 1)
	).then(d => d[0]),
	$.value(".").then(cb)
)
.then(d => {
	// console.log(d," => ",d[0].value+".",getSpan(d))
	return {
		value: d[0].value+".",
		mainForm: d[0].mainForm+".",
		span: getSpan(d)
	}
})

let FNAME = $.all(
	$.hasTag("fname").then(cb),
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
)
.then( d => d[0])
.then( d => ({
	value: { fname: d.value },
	mainForm: { fname: d.mainForm },
	span: getSpan(d)
}))

let PNAME =	$.all(
	$.hasTag("pname").then(cb),
	$.not($.hasTag("abbr"))
)
.then( d => d[0])
.then( d => ({
	value: { pname: d.value },
	mainForm: { pname: d.mainForm },
	span: getSpan(d)
}))

let LNAME = $.any(
	
	$.all(
		$.hasTag("lname").then(cb),
		$.not($.hasTag("abbr")),
		$.not(
			$.any(
				$.all(	
					$.hasTag("adj"),
					$.sameGNC
				).then(d => d[0]),
				
				// $.all(
				// 	$.hasTag("noun"),
				// 	$.next(
				// 		$.not($.hasTag("prep","conj")),
				// 		$.hasTag("v_rod")
				// 	)
				// ).then(d => d[0])
				
			)
		)
	)
	.then(d => d[0])
	.then( d => ({
		value: { lname: d.value },
		mainForm:{ lname: d.mainForm },
		span: getSpan(d)
	})),

	$.all(
		$.token("UK").then(cb),
		$.capitalized,
		$.any(
			$.prev(FNAME),
			$.prev(PNAME),
			$.prev(
				$.prev(INITIAL)
			)
		)
	).then(d => d[0])
	.then( d => ({
		value: {lname: d.value },
		mainForm: {lname: d.mainForm },
		span: getSpan(d)
	}))

) 


let INITIAL_FNAME_PNAME = $.sequence(
	INITIAL,
	INITIAL
)
// 	$.all(
// 		$.token("UK"),
// 		$.capitalized,
// 		$(data => data.item.value.length == 1)
// 	).then( d => d[0]),
// 	$.value("."),
// 	$.all(
// 		$.token("UK"),
// 		$.capitalized,
// 		$(data => data.item.value.length == 1)
// 	).then( d => d[0]),
// 	$.value(".")	
// )
.then( d => ({
	
	value: {
		fname: d[0].value,
		pname: d[1].value
	},

	mainForm: {
		fname: d[0].mainForm,
		pname: d[1].mainForm
	},

	span: getSpan(d)

}))

let INITIAL_FNAME = $.sequence(
	INITIAL
)
.then(d => d[0])
.then( d => ({
	value: { fname: d.value},
	mainForm: { fname: d.mainForm },

	span: getSpan(d)

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

		span: getSpan(d)
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

		span: getSpan(d)
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

		span: getSpan(d)
	}	
})


let FNAME_LNAME = $.all( 
	$.sequence( FNAME, LNAME),
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

		span: getSpan(d)
	}	
})

let LNAME_FNAME = $.all( 
	$.sequence( LNAME, FNAME),
	// $.sameGNC
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

		span: getSpan(d)
	}	
})

let INITIAL_FNAME_PNAME_LNAME = $.sequence( INITIAL_FNAME_PNAME, LNAME)
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

			span: getSpan(d)
		}	
	})

let LNAME_INITIAL_FNAME_PNAME = $.sequence( LNAME, INITIAL_FNAME_PNAME)
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

			span: getSpan(d)
		}	
	})

let LNAME_INITIAL_FNAME = $.sequence( LNAME, INITIAL_FNAME)
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

			span: getSpan(d)
		}	
	})

let INITIAL_FNAME_LNAME = $.sequence( INITIAL_FNAME, LNAME)
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

			span: getSpan(d)
		}	
	})


let PERSONE = $.any(
	FNAME_PNAME_LNAME,
	LNAME_FNAME_PNAME,

	INITIAL_FNAME_PNAME_LNAME,
	LNAME_INITIAL_FNAME_PNAME,
	FNAME_LNAME,
	LNAME_FNAME,
	INITIAL_FNAME_LNAME,
	LNAME_INITIAL_FNAME,
	
	FNAME,
	LNAME
).then( d => {
	d.token = "PERSONE"
	return d 
})

module.exports = [
	PERSONE
] 

