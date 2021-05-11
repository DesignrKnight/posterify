const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.static('./generated')); //Serves resources from public folder

app.get('/', async (req, res) => {
	// console.log(req.query.text);
	let contentHtml = fs.readFileSync('design/sampleIn.html', 'utf-8');
	const message = req.query.text.replace(/(?:\r\n|\r|\n)/g, '<br>');
	const hashtags = req.query.text.match(/#(\w)+/g);
	console.log(hashtags);
	contentHtml = contentHtml.replace('Description', message);
	fs.writeFileSync('design/sampleOut.html', contentHtml);
	const browser = await puppeteer.launch({
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});
	const page = await browser.newPage();
	await page.setViewport({
		width: 1080,
		height: 1080,
		deviceScaleFactor: 1,
	});
	// await page.setContent(contentHtml);
	await page.goto(`file:${path.join(__dirname, 'design/sampleOut.html')}`);
	await page.screenshot({ path: path.join(__dirname, `\\generated\\image.png`) });
	await browser.close();
	res.sendFile(path.join(__dirname, `\\generated\\image.png`));
});

app.listen(process.env.PORT || 5000, () => {
	console.log('now listening for requests on port 5000');
});
