const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(express.static('./generated')); //Serves resources from public folder

app.get('/', async (req, res) => {
	// console.log(req.query.text);
	let contentHtml = fs.readFileSync('design/sampleIn.html', 'utf-8');
	if (!req.query.text) {
		res.send({ message: 'text argument missing' });
		return;
	}
	const message = req.query?.text.replace(/(?:\r\n|\r|\n)/g, '<br>').replace(/(#\w+-?\w+-?\w+-?\w+)/g, '');
	const hashtags = req.query?.text.match(/(#\w+-?\w+-?\w+-?\w+)/g);
	if (hashtags) {
		const tags = hashtags.map((item) => {
			return item.replace('-', ' ').replace('#', '');
		});
		const tagsElement = tags.map((item, index) => {
			return `
        <p style="position: absolute;
        height: 42px;
        left: 70px;
        top: ${128 + 52 * index}px;
        padding-left: 20px;
        padding-right: 20px;
        font-family: Poppins;
        font-style: normal;
        font-weight: 500;
        font-size: 26px;
        line-height: 42px;
        background: #FFFFFF;
        border-radius: 20px;"
        color: #17171D;>${item}</p>`;
		});
		contentHtml = contentHtml.replace('<p></p>', tagsElement.join(''));
	}
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
	await page.goto(`file:${path.join(__dirname, 'design/sampleOut.html')}`, { waitUntil: 'networkidle0' });
	await page.screenshot({ path: path.join(__dirname, `\\generated\\image.png`) });
	await browser.close();
	res.sendFile(path.join(__dirname, `\\generated\\image.png`));
});

app.listen(process.env.PORT || 5000, () => {
	console.log('now listening for requests on port 5000');
});
