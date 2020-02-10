let scanner = require("../src/parser/scanner")

expect.extend(require("./util"))

describe("Scanner test suite", () => {
	test("instantiate scanner", () => {
		expect(scanner([0,1,2])).toBeDefined()
	})
	
	test("instantiate empty scanner", () => {
		expect(scanner()).toBeDefined()
	})

	test("test navigation", () => {
		let s = scanner([0,1,2])
		expect(s.tag(0).item).toBe(0)
		expect(s.tag(2).item).toBe(2)
		expect(s.tag(5)).not.toBeNull()
		expect(s.first().item).toBe(0)
		expect(s.last().item).toBe(2)
		expect(s.first().next().item).toBe(1)
		expect(s.last().prev().item).toBe(1)
		expect(s.atRight(s.first(),2).item).toBe(2)
		expect(s.atLeft(s.last(),2).item).toBe(0)

	})

	test("test slices", () => {
		let s = scanner([0,1,2])
		expect(s.arroundLeft(s.last(),2)).toBeArray()
		expect(s.arroundLeft(s.last(),2)).toHaveLength(2)
		
		expect(s.arroundRight(s.first(),2)).toBeArray()
		expect(s.arroundRight(s.first(),2)).toHaveLength(2)
		
		expect(s.arround(s.first().next(),2)).toBeArray()
		expect(s.arround(s.first().next(),2)).toHaveLength(2)
	})

})
