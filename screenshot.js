const puppeteer = require('puppeteer');
const data = require('./siteData.json');

const screenshot = async (data = []) => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setViewport({ width: 1440, height: 900 });
	const paths = [];
	for (let url of data) {
		await page.goto(url.startsWith('http') ? url : `https://${url}}`);
		console.log('went to:', url);
		await page.waitFor(1000);
		const bodyHandle = await page.$('body');
		const { width, height } = await bodyHandle.boundingBox();
		const [pathName] = url.split('.');
		console.log('path', pathName, url);
		const path = `public/${pathName.substring(7, pathName.length)}.png`;
		const screenshot = await page.screenshot({
			clip: {
				x: 0,
				y: 0,
				width,
				height,
			},
			type: 'png',
			path,
		});
		paths.push(path);
		console.log('screenshot', url);
		await bodyHandle.dispose();
	}
	await browser.close();
	return paths;
};

// screenshot();

module.exports = screenshot;
