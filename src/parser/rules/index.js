let _ = require("lodash-node")
let $ = require("../predicates")





	let inDictionary = dict => $( data => _.find(dict, d => d == data.item.value)).then( d => d)

	let mainFormIn = dict => $( data => {
		if(data.item && data.item.interpretation){
			let f = _.find(data.item.interpretation, i => _.find(dict, d => d == i.mainForm))
			return !!f
		}
	}).then( d => d )

	let value =  v => $( data => {
		return (v instanceof RegExp ) ? v.test(data.item.value) : data.item.value == v
	})

	let valueRange =  (min, max) => $( data => 
		data.item.token == "INT" && Number.parseInt(data.item.value) >= min  && Number.parseInt(data.item.value) <= max 
	)

	
	let mainForm = v => $( data => {
		if( data.item && data.item.interpretation ){
			let f = _.find(
				data.item.interpretation, 
				i => (v instanceof RegExp ) ? v.test(i.mainForm) : i.mainForm == v
			)
			return !!f
		}
	}).then( d => d )

	let hasTag = (...values) => $(data => {
		if( data.item.token == "UK"){
					let res = false
					// console.log(value)
					let _value = values
					data.item.interpretation.forEach( i => {
						res |= _value.map( v => i.tags[v]).filter( v => v).length == _value.length
					})
					return res
		}					
	})
	// .then( d => {
	// 	d.item.interpretation = d.item.interpretation.filter( i => {
	// 		let t = values.map( v => i.tags[v]).filter( v => v)
	// 		return t.length == values.length
	// 	})
	// 	return d
	// })

	let hasAnyTag = (...values) => $(data => {
		if( data.item.token == "UK"){
					let res = false
					let _value = values
					data.item.interpretation.forEach( i => {
						res |= _value.map( v => i.tags[v]).filter( v => v).length > 0
					})
					return res
		}					
	})
	// .then( d => {
	// 	d.item.interpretation = d.item.interpretation.filter( i => {
	// 		let t = values.map( v => i.tags[v]).filter( v => v)
	// 		return t.length > 0
	// 	})
	// 	return d
	// })

	let vidminok = hasTag // 	v_naz, v_zna, v_rod, v_dav , v_oru, v_kly, v_mis
	let gender = hasTag // f, m


	let multiple = hasTag("p")

	// Available tokens: 
	
		// UK 
		// LAT 
		// PUNCT 
		// INT 
		// OTHER 
		// EOL


	let token = value => $(data => {
		return data.item.token == value
	}).then( d => {
		return d
	})

	let noToken = value => $(data => {
		return data.item.token != value
	}).then( d => {
		return d
	})

	let capitalized = $(data => data.item.value === _.capitalize(data.item.value)).then( d => d)

	let sameGenderWithNext = $( data => {
				let next = data.next()
				if(!next) return false

				// console.log(data.item.value," g ", next.item.value)

				if( data.item.interpretation && next.item.interpretation){
					let res = false
					data.item.interpretation.forEach( i1 => {
						next.item.interpretation.forEach( i2 => {
							res |= (i1.tags.f && i2.tags.f) || (i1.tags.m && i2.tags.m)
						})
					})
					return res 
				}
			}).then(d => d)

	let sameGenderWithPrev = $( data => {
				let next = data.prev()
				if(!next) return false

				if( data.item.interpretation && next.item.interpretation){
					let res = false
					data.item.interpretation.forEach( i1 => {
						next.item.interpretation.forEach( i2 => {
							res |= (i1.tags.f && i2.tags.f) || (i1.tags.m && i2.tags.m)
						})
					})
					return res 
				}
			}).then(d => d)

	let sameNumberWithNext = $( data => {
				let next = data.next()
				if(!next) return false
				// console.log(data.item.value," n ", next.item.value)

				if( data.item.interpretation && next.item.interpretation){
					let res = false
					data.item.interpretation.forEach( i1 => {
						next.item.interpretation.forEach( i2 => {
							res |= (i1.tags.p && i2.tags.p) || (!i1.tags.p && !i2.tags.p)
						})
					})
					return res 
				}
			}).then(d => d)

	let sameNumberWithPrev = $( data => {
				let next = data.prev()
				if(!next) return false

				if( data.item.interpretation && next.item.interpretation){
					let res = false
					data.item.interpretation.forEach( i1 => {
						next.item.interpretation.forEach( i2 => {
							res |= (i1.tags.p && i2.tags.p) || (!i1.tags.p && !i2.tags.p)
						})
					})
					return res 
				}
			}).then(d => d)

	let sameCaseWithNext = $( data => {
				let next = data.next()
				if(!next) return false
				// console.log(data.item.value," c ", next.item.value)

				if( data.item.interpretation && next.item.interpretation){
					let res = false
					data.item.interpretation.forEach( i1 => {
						next.item.interpretation.forEach( i2 => {
							res |= 		(i1.tags.v_naz && i2.tags.v_naz) 
									|| 	(i1.tags.v_zna && i2.tags.v_zna)
									|| 	(i1.tags.v_rod && i2.tags.v_rod)
									|| 	(i1.tags.v_dav && i2.tags.v_dav)
									|| 	(i1.tags.v_oru && i2.tags.v_oru)
									|| 	(i1.tags.v_kly && i2.tags.v_kly)
									|| 	(i1.tags.v_mis && i2.tags.v_mis)
						})
					})
					return res 
				}
			}).then(d => d)

	let sameCaseWithPrev = $( data => {
				let next = data.prev()
				if(!next) return false

				if( data.item.interpretation && next.item.interpretation){
					let res = false
					data.item.interpretation.forEach( i1 => {
						next.item.interpretation.forEach( i2 => {
							res |= 		(i1.tags.v_naz && i2.tags.v_naz) 
									|| 	(i1.tags.v_zna && i2.tags.v_zna)
									|| 	(i1.tags.v_rod && i2.tags.v_rod)
									|| 	(i1.tags.v_dav && i2.tags.v_dav)
									|| 	(i1.tags.v_oru && i2.tags.v_oru)
									|| 	(i1.tags.v_kly && i2.tags.v_kly)
									|| 	(i1.tags.v_mis && i2.tags.v_mis)
						})
					})
					return res 
				}
			}).then(d => d)

	let sameGNCWithNext = $.all (
		sameGenderWithNext, 
		sameNumberWithNext, 
		sameCaseWithNext
	).then( d => d[0])
	
	let sameGNCWithPrev = $.all (
		sameGenderWithPrev, 
		sameNumberWithPrev, 
		sameCaseWithPrev
	).then( d => d[0])



module.exports = _.extend($, {

		"in": inDictionary,
		mainFormIn,
		value,
		valueRange,
		mainForm,
		hasTag,
		hasAnyTag,
		gender,
		vidminok,
		multiple,
		token,
		noToken,
		capitalized,

		sameGender: sameGenderWithNext, 
		sameNumber:sameNumberWithNext, 
		sameCase: sameCaseWithNext,
		sameGNC: sameGNCWithNext,

		sameGenderWithPrev, 
		sameNumberWithPrev, 
		sameCaseWithPrev,
		sameGNCWithPrev
})