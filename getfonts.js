const puppeteer = require('puppeteer');
const cache = new Map();

module.exports = async url => {
	if (cache.has(url)) {
		return cache.get(url);
	}
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(url);
	const data = await page.evaluate(() => {
		const elements = document.querySelectorAll('link');
		return Array.from(elements)
			.map(el => el.rel === 'stylesheet' && el.href)
			.filter(Boolean);
	});
	const uniqueData = [...new Set(data)];
	await browser.close();
	cache.set(url, uniqueData);
	return uniqueData;
};
