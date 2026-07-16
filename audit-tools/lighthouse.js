const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'results');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

const urlsToTest = [
  'https://charisbilleasy.store/',
  'https://charisbilleasy.store/login',
  'https://charisbilleasy.store/register'
];

async function runLighthouse() {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {logLevel: 'info', output: 'html', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'], port: chrome.port};
  
  for (const url of urlsToTest) {
    console.log(`Running lighthouse for ${url}...`);
    try {
        const runnerResult = await lighthouse(url, options);
        // `.report` is the HTML report as a string
        const reportHtml = runnerResult.report;
        const fileName = url.replace('https://charisbilleasy.store', '').replace(/[^a-z0-9]/gi, '_') || 'home';
        fs.writeFileSync(path.join(OUTPUT_DIR, `lighthouse_${fileName}.html`), reportHtml);
        
        // Print out the scores
        console.log(`Scores for ${url}:`);
        console.log(`Performance: ${runnerResult.lhr.categories.performance.score * 100}`);
        console.log(`Accessibility: ${runnerResult.lhr.categories.accessibility.score * 100}`);
        console.log(`Best Practices: ${runnerResult.lhr.categories['best-practices'].score * 100}`);
        console.log(`SEO: ${runnerResult.lhr.categories.seo.score * 100}`);
    } catch(err) {
        console.error(`Failed to run lighthouse on ${url}:`, err);
    }
  }
  
  await chrome.kill();
}

runLighthouse();
