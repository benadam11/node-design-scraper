const fetch = require('node-fetch');
const cheerio = require('cheerio');

const cache = new Map();

module.exports = async url => {
	if (cache.has(url)) {
		return cache.get(url);
	}
	const data = await fetch(url)
		.then(res => res.text())
		.then(html =>
			cheerio
				.load(html)("meta[name='description']")
				.attr('content')
		);

	cache.set(url, data);
	return data;
};
