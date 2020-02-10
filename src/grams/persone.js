let $ = require("../parser/rules")

let FNAME = $.all(
	$.hasTag("fname"),
	$.not($.hasTag("abbr"))
).then( d => ({ 
		token: "NAME",
		value: d[0].item.value,
		interpretation:d[0].item.interpretation,
		childs:[d[0].item]
}))

let PNAME =	$.all(
	$.hasTag("pname"),
	$.not($.hasTag("abbr"))
).then( d => ({ 
		token: "MIDDLE_NAME",
		value: d[0].item.value,
		interpretation:d[0].item.interpretation,
		childs:[d[0].item]
}))

let LNAME = $.all(
	$.hasTag("lname"),
	$.not($.hasTag("abbr"))
).then( d => ({ 
		token: "LAST_NAME",
		value: d[0].item.value,
		interpretation:d[0].item.interpretation,
		childs:[d[0].item]
}))

let SHORT_FNAME_PNAME = $.cursor(
	$.all(
		$.token("UK"),
		$.capitalized,
		$(data => data.item.value.length == 1)
	).then( d => d[0]),
	$( data => data.item.value == "."),
	$.all(
		$.token("UK"),
		$.capitalized,
		$(data => data.item.value.length == 1)
	).then( d => d[0]),
	$( data => data.item.value == ".")	
).then( d => ({
	token:"SHORT_FNAME_PNAME",
	value:{
		fname: d[0].item.value+".",
		pname: d[2].item.value+"."
	},
	mainForm:{
		fname: d[0].item.value+".",
		pname: d[2].item.value+"."
	}	
}))								

let SHORT_FNAME = $.cursor(
	$.all(
		$.token("UK"),
		$.capitalized,
		$(data => data.item.value.length == 1)
	).then(d => d[0]),
	$( data => data.item.value == ".")	
).then( d => {
	return {
		token:"SHORT_FNAME",
		value:{
			fname: d[0].item.value+"."
		},
		mainForm:{
			fname: d[0].item.value+"."
		}
	}		
})


let FNAME_PNAME_LNAME = $.all(
					
	$.cursor(
			$.token("NAME"),
			$.token("MIDDLE_NAME"),
			$.token("LAST_NAME")
		),
		
	$.cursor(
		$.sameGNC,
		$.sameGNC
	)

).then( d => {
	return {
		value: {
			fname: d[0][0].item.value,
			pname: d[0][1].item.value,
			lname: d[0][2].item.value
		},
		mainForm: {
			fname: d[0][0].item.interpretation[0].mainForm,
			pname: d[0][1].item.interpretation[0].mainForm,
			lname: d[0][2].item.interpretation[0].mainForm
		}
	}		
})

let LNAME_PNAME_FNAME = $.all(  			
	$.cursor(
		$.token("LAST_NAME"),
		$.token("NAME"),
		$.token("MIDDLE_NAME")
	),
	
	$.cursor(
		$.sameGNC,
		$.sameGNC
	)

).then( d => {
	return {
		value: {
			fname: d[0][2].item.value,
			pname: d[0][1].item.value,
			lname: d[0][0].item.value
		},
		mainForm: {
			fname: d[0][2].item.interpretation[0].mainForm,
			pname: d[0][1].item.interpretation[0].mainForm,
			lname: d[0][0].item.interpretation[0].mainForm	
		}	
	}	
})

let FNAME_PNAME = $.all( 
	$.cursor(
			$.token("NAME"),
			$.token("MIDDLE_NAME")
	),
	$.sameGNC
).then( d => {
	return {
		value: {
			fname: d[0][0].item.value,
			mname: d[0][1].item.value
		},
		mainForm:{
			fname: d[0][0].item.interpretation[0].mainForm,
			mname: d[0][1].item.interpretation[0].mainForm	
		}	
	}	
})

let PNAME_FNAME = $.all( 
	$.cursor(
		$.token("MIDDLE_NAME"),
		$.token("NAME")
	),
	$.sameGNC
).then( d => {
	return {
		value: {
			fname: d[0][1].item.value,
			mname: d[0][0].item.value
		},
		mainForm: {
			fname: d[0][1].item.interpretation[0].mainForm,
			mname: d[0][0].item.interpretation[0].mainForm	
		}	
	}	
})

let FNAME_LNAME = $.all( 
	$.cursor(
			$.token("NAME"),
			$.token("LAST_NAME")
	),
	$.sameGNC
).then( d => {
	return {
		value: {
			fname: d[0][0].item.value,
			lname: d[0][1].item.value
		},
		mainForm: {
			fname: d[0][0].item.interpretation[0].mainForm,
			lname: d[0][1].item.interpretation[0].mainForm
		}	
	}	
})

let LNAME_FNAME = $.all( 
	$.cursor(
			$.token("LAST_NAME"),
			$.token("NAME")
	),
	$.sameGNC
).then( d => {
	return {
		value:{
			fname: d[0][1].item.value,
			lname: d[0][0].item.value
		},
		mainForm:{
			fname: d[0][1].item.interpretation[0].mainForm,
			lname: d[0][0].item.interpretation[0].mainForm	
		}	
	}	
})

let SHORT_FNAME_PNAME_LNAME = $.cursor(
	$.token("SHORT_FNAME_PNAME"),
	$.token("LAST_NAME")
).then( d => {
	return {
		value:{
			fname: d[0].item.value.fname,
			pname: d[0].item.value.pname,
			lname: d[1].item.value
		},
		mainForm:{
			fname: d[0].item.mainForm.fname,
			pname: d[0].item.mainForm.pname,
			lname: d[1].item.interpretation[0].mainForm	
		}	
	}	
})

let LNAME_SHORT_FNAME_PNAME = $.cursor(
	$.token("LAST_NAME"),
	$.token("SHORT_FNAME_PNAME")
).then( d => {
	return {
		value:{
			fname: d[1].item.value.fname,
			pname: d[1].item.value.pname,
			lname: d[0].item.value
		},
		mainForm:{
			fname: d[1].item.mainForm.fname,
			pname: d[1].item.mainForm.pname,
			lname: d[0].item.interpretation[0].mainForm	
		}	
	}	
})

let LNAME_SHORT_FNAME = $.cursor(
	$.token("LAST_NAME"),
	$.token("SHORT_FNAME")
).then( d => {
	return {
		value:{
			fname: d[1].item.value.fname,
			lname: d[0].item.value
		},
		mainForm:{
			fname: d[1].item.mainForm.fname,
			lname: d[0].item.interpretation[0].mainForm	
		}	
	}	
})

let SHORT_FNAME_LNAME = $.cursor(
	$.token("SHORT_FNAME"),
	$.token("LAST_NAME"),
).then( d => {
	return {
		value:{
			fname: d[0].item.value.fname,
			lname: d[1].item.value
		},
		mainForm:{
			fname: d[0].item.mainForm.fname,
			lname: d[1].item.interpretation[0].mainForm	
		}	
	}	
})

let FNAME_ONLY = $.token("NAME")
	.then( d => {
		return {
			value:{
				fname: d.item.value
			},
			mainForm:{
				fname: d.item.interpretation[0].mainForm	
			}	
		}	
	})

let LNAME_ONLY = $.token("LAST_NAME")
	.then( d => {
		return {
			value:{
				lname: d.item.value
			},
			mainForm:{
				lname: d.item.interpretation[0].mainForm	
			}	
		}	
	})

let PERSONE = $.any(
	FNAME_PNAME_LNAME,
	LNAME_PNAME_FNAME,
	SHORT_FNAME_PNAME_LNAME,
	LNAME_SHORT_FNAME_PNAME,
	FNAME_LNAME,
	LNAME_FNAME,
	FNAME_PNAME,
	SHORT_FNAME_LNAME,
	LNAME_SHORT_FNAME,
	FNAME_ONLY,
	LNAME_ONLY
).then( d => { 
	return {	
		token: "PERSONE",
		value: d.value,
		mainForm: d.mainForm
	}	
})

module.exports = [
	SHORT_FNAME_PNAME,
	SHORT_FNAME,
	FNAME,
	PNAME,
	LNAME,
	PERSONE
] 

