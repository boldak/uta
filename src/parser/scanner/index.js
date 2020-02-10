let _ = require("lodash-node")


/** Клас тега */
class Tag {
	/**
     * Створює примірник тега. 
     * @param {int} index - Позиція в масиві.
     * @param {*} value - Значення тега.
     * @param {Scanner} scanner - Посилання на {@link Scanner}.
    */
	constructor(index, value, scanner){
		this._index = index
		this.item = value
		this.scanner = scanner
	}

	/**
     * Повертає тег ліворуч
     * @param {int}  count - зміщення.
     
     * @return {Tag} -  Примірник {@link Tag} ліворуч від поточного на {count} позиції.
    */
		
	atLeft(count){
		return this.scanner.atLeft(this, count)
	}	

	/**
     * Повертає тег праворуч
     * @param {int}  count - зміщення.
     
     * @return {Tag} -  Примірник {@link Tag} праворуч від поточного на {count} позиції.
    */
	
	atRight(count){
		return this.scanner.atRight(this, count)
	}

	/**
     * Повертає тег на вказаній позиції
     * @param {int}  pos - позиція.
     
     * @return {Tag} -  Примірник {@link Tag} на позиції {pos}.
    */

	atIndex(pos){
		return this.scanner.tag(pos)	
	}		
	
	/**
     * Повертає наступний тег
     * @return {Tag} -  Примірник {@link Tag}.
    */

	next(tag){ 
		return this.scanner.next(this)
	}	

	/**
     * Повертає попередній тег
     * @return {Tag} -  Примірник {@link Tag}.
    */

	prev(tag){
		return this.scanner.prev(this)
	}	
	
	/**
     * Повертає масив тегів ліворуч
     * @param {int} count - Розмір вікна.
     * @return {Tag} -  Масив {@link Tag}.
    */
	
	arroundLeft(count){
		return this.scanner.arroundLeft(this, count)
	}
	
	/**
     * Повертає масив тегів праворуч
     * @param {int} count - Розмір вікна.
     * @return {Tag} -  Масив {@link Tag}.
    */
	
	arroundRight(count){
		return this.scanner.arroundRight(this, count)
	}

	/**
     * Повертає масив тегів навколо
     * @param {int} count - Розмір вікна.
     * @return {Tag} -  Масив {@link Tag}.
    */
	
	arround(count){
		return this.scanner.arround(this, count)
	}

}

/** Клас сканера */
class Scanner {
	/**
     * Створює примірник сканера. 
     * @param {Array.<*>} tags - Вхідний масив тегів.
    */
	constructor(tags){
		tags = tags || []
		tags = _.isArray(tags) ? tags : [tags]
		this.tags = tags.map( (t, index) => new Tag(index, t, this))
	}

	/**
     * Повертає тег 
     * @param {int}  - Порядковий номер тега в масиві (індекс).
     * @return {Tag} -  Примірник {@link Tag}.
    */

	tag(pos){
		pos = pos || 0
		return this.tags[pos]
	}
	
	/**
     * Повертає перший тег масива 
     * @return {Tag} -  Примірник {@link Tag}.
    */
	
	first(){
		return (this.tags.length > 0) ? this.tag(0) : null
	}

	/**
     * Повертає останній тег масива 
     * @return {Tag} -  Примірник {@link Tag}.
    */
	
	last(){
		return (this.tags.length > 0) ? this.tag(this.tags.length-1) : null
	}

	/**
     * Повертає тег ліворуч від поточного тега
     * @param {Tag} tag - поточний {@link Tag}.
     * @param {int}  count - зміщення.
     
     * @return {Tag} -  Примірник {@link Tag} ліворуч від поточного на {count} позиції.
    */
	
	atLeft(tag, count){
		return ((tag._index - count) < 0 ) ? null : this.tags[tag._index - count]
	}	

	/**
     * Повертає тег праворуч від поточного тега
     * @param {Tag} tag - поточний {@link Tag}.
     * @param {int}  count - зміщення.
     
     * @return {Tag} -  Примірник {@link Tag} праворуч від поточного на {count} позиції.
    */
	
	atRight(tag, count){
		return ((tag._index + count) > this.tags.length - 1 ) ? null : this.tags[tag._index + count]
	}		
	
	/**
     * Повертає наступний від поточного тег
     * @param {Tag} tag - поточний {@link Tag}.
     
     * @return {Tag} -  Примірник {@link Tag}, наступний за поточним.
    */
	
	next(tag){ 
		return this.atRight(tag, 1)
	}	

	/**
     * Повертає попередній від поточного тег
     * @param {Tag} tag - поточний {@link Tag}.
     
     * @return {Tag} -  Примірник {@link Tag}, попередній від поточного.
    */

	prev(tag){
		return this.atLeft(tag, 1)
	}	
	
	/**
     * Повертає масив тегів ліворуч від поточного
     * @param {Tag} tag - поточний {@link Tag}.
     * @param {int} count - Розмір вікна.
     * @return {Tag} -  Масив {@link Tag}, ліворуч від поточного.
    */
	
	arroundLeft(tag, count){
		let start = tag._index - count
		start = (start < 0 ) ? 0 : start
		return _.slice(this.tags, start, tag._index)
	}
	
	/**
     * Повертає масив тегів праворуч від поточного
     * @param {Tag} tag - поточний {@link Tag}.
     * @param {int} count - Розмір вікна.
     * @return {Tag} -  Масив {@link Tag}, праворуч від поточного.
    */
	arroundRight(tag, count){
		let stop = tag._index + count + 1
		stop = (stop > this.tags.length + 1 ) ? this.tags.length + 1 : stop
		return _.slice(this.tags, tag._index+1, stop)
	}

	/**
     * Повертає масив тегів навколо від поточного
     * @param {Tag} tag - поточний {@link Tag}.
     * @param {int} count - Розмір вікна.
     * @return {Tag} -  Масив {@link Tag}, навколо від поточного.
    */

	arround(tag, count){
		return _.flatten([this.arroundLeft(tag, count), this.arroundRight(tag, count)])
	} 

}

/**
 * Сканер масиву тегів.
 * Забезпечує двосторонню навігацію в масиві тегів
 * @module scanner
 */

/**
 * Повертає примірник {@link Scanner}.
 * @param {Array.<*>} tags - Вхідний масив тегів.
 * @return {Scanner} примірник {@link Scanner}
*/

module.exports = (tags) => {
	return new Scanner(tags)
}	

