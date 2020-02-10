let tokenize = require("../src/tokenizer")

expect.extend(require("./util"))

let s = [
	`  	Джерело`,
	`Джерело  `,
	`Джерело: указ глави держави`,
	`1-2`,
	'Google'
]

describe("Tokenizer test suite", () => {
	
	test('ignore start whitespaces', () => {
	  return tokenize(s[0]).then(res => {
	    expect(res).toHaveLength(1);
	  });
	});

	test('ignore end whitespaces', () => {
	  return tokenize(s[1]).then(res => {
	    expect(res).toHaveLength(1);
	  });
	});

	test('returns array of tokens', () => {
	  return tokenize(s[2]).then(res => {
	    expect(res).toHaveLength(5);
	  });
	});

	test('expect vesum interpretation', () => {
	  return tokenize(s[1]).then(res => {
	    expect(res[0].interpretation).toBeDefined();
	    expect(res[0].interpretation).toBeArray();
	    expect(res[0].interpretation).toHaveLength(6);
	  });
	});

	test("not expect vesum interpretation for not UK tokens", () => {
		return tokenize(s[3]).then(res => {
	    expect(res[0].interpretation).not.toBeDefined();
	  });
	})

})

