const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const parseCss = require('css');
const fs = require('fs');
const path = require('path');
const baseUrl = require('url');
const fileType = require('file-type');
var crypto = require('crypto');

module.exports = async url => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	let fontPaths = [];
	page.on('response', async response => {
		const url = response.url();
		if (response.request().resourceType() === 'font') {
			writeFontFile(response).then(fontPath => {
				const extension = fontPath.split('.').pop();
				const [name] = fontPath
					.split('/')
					.pop()
					.split('.');
				fontPaths.push({ fontPath, name, extension });
			});
		}
	});
	await page.goto(url);
	await page.waitFor(1000);
	// const data = await page.evaluate(() =>
	// 	Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(
	// 		el =>
	// 			window
	// 				.getComputedStyle(el)
	// 				.getPropertyValue('font-family')
	// 				.split(',')[0]
	// 	)
	// );

	// console.log(data);
	await browser.close();
	return fontPaths;
};

function writeFontFile(res) {
	return res.buffer().then(file => {
		let fileName = baseUrl
			.parse(res.url())
			.pathname.split('/')
			.pop();
		if (fileName.length > 64) {
			fileName = `${crypto
				.createHash('md5')
				.update(fileName)
				.digest('hex')}.woff2`;
		}
		const filePath = `./public/fonts/${fileName}`;
		const writeStream = fs.createWriteStream(filePath);
		writeStream.write(file);
		return filePath;
	});
}

// splitUrlIntoObject(url) {
// 	baseUrl
// 			.parse(res.url())
// 			.pathname.split('/')
// 			.pop();
// }
