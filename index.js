const express = require('express');
const fetch = require('node-fetch');
const fileType = require('file-type');
const path = require('path');
const fs = require('fs');
const server = express();
const screenshot = require('./screenshot');
const getFonts = require('./getfonts');
const parseHtml = require('./parsehtml');
const parseCss = require('./parsecss');

const fontAssets = path.resolve(__dirname, './public/fonts');
server.use('/public/fonts', express.static(fontAssets));
server.set('port', process.env.PORT || 3000);

server.get('/', (req, res) => {
	res.send('hello world');
});

server.get('/screenshot', (req, res) => {
	(async () => {
		try {
			const url = [(req.query && req.query.url) || 'https://godaddy.com'];
			const [ssPath] = await screenshot(url);
			res.sendFile(path.join(__dirname, ssPath));
		} catch (e) {
			res.send(e);
		}
	})();
});

server.get('/fonts', (req, res) => {
	(async () => {
		try {
			const url = (req.query && req.query.url) || 'https://godaddy.com';
			const fonts = await getFonts(url);
			res.json({ fonts });
		} catch (e) {
			res.send('error');
		}
	})();
});

server.get('/html', (req, res) => {
	(async () => {
		try {
			const url = (req.query && req.query.url) || 'https://godaddy.com';
			const data = await parseHtml(url);
			res.json({ data });
		} catch (e) {
			res.send('error');
		}
	})();
});

server.get('/css', (req, res) => {
	(async () => {
		try {
			const url = (req.query && req.query.url) || 'https://godaddy.com';
			const data = await parseCss(url);
			res.json({ data });
		} catch (e) {
			res.send(e);
		}
	})();
});

const template = async data => {
	let str = '';
	data.forEach(({ name, fontPath, extension }) => {
		const tmp = `
			<style>
				@font-face {
					font-family: '${name}';
					src: url('${fontPath}') format('${extension}');
				}
				.${name} {
					font-family: '${name}';
					font-size: 48px;
				}
			</style>
			<h4 class='${name}'>This is a test</h4>
		`;
		str += tmp;
	});

	return `<html>${str}</html>`;
};

server.get('/preview', (req, res) => {
	(async () => {
		try {
			const url = (req.query && req.query.url) || 'https://godaddy.com';
			const data = await parseCss(url);
			const str = await template(data);
			res.send(str);
		} catch (e) {
			res.send(e);
		}
	})();
});

server.get('*', (req, res) => {
	res.writeHead(404);
	res.end('File not found.');
});

server.listen(3000, () => {
	console.log('Express server started at port 3000');
});
