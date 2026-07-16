const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'results');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

const EMAIL = 'pachu@gmail.com';
const PASSWORD = 'nishu@143';
const BASE_URL = 'https://charisbilleasy.store';

async function crawl() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ recordHar: { path: path.join(OUTPUT_DIR, 'network.har') } });
  const page = await context.newPage();

  const logs = [];
  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => logs.push(`[ERROR] ${error.message}`));
  
  // Track failed requests
  const failedRequests = [];
  page.on('requestfailed', request => failedRequests.push(`[FAILED] ${request.url()} - ${request.failure().errorText}`));
  page.on('response', response => {
    if (response.status() >= 400) {
      failedRequests.push(`[HTTP ${response.status()}] ${response.url()}`);
    }
  });

  try {
    console.log('Navigating to login...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    // Try to login
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    
    // Attempt to click the submit button
    // The exact selector might vary, let's try a generic approach
    console.log('Attempting to click submit button...');
    const submitButton = await page.$('button[type="submit"]');
    if (submitButton) {
      await submitButton.click();
    } else {
      // Sometimes it's not type=submit
      await page.click('button:has-text("Login"), button:has-text("Sign in")');
    }

    console.log('Waiting for network idle after login...');
    await page.waitForLoadState('networkidle');

    // Take screenshot of dashboard
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'dashboard.png'), fullPage: true });

    // We will extract all links and try to crawl them
    const links = await page.$$eval('a', anchors => anchors.map(a => a.href).filter(href => href.startsWith('https://charisbilleasy.store') && !href.includes('logout')));
    const uniqueLinks = [...new Set(links)];

    console.log(`Found ${uniqueLinks.length} unique internal links to crawl.`);

    for (let i = 0; i < uniqueLinks.length; i++) {
      const link = uniqueLinks[i];
      console.log(`Crawling ${i+1}/${uniqueLinks.length}: ${link}`);
      
      try {
        await page.goto(link, { waitUntil: 'networkidle', timeout: 15000 });
        
        // Wait an extra second for UI to settle (modals, animations)
        await page.waitForTimeout(1000);
        
        const fileName = link.replace(BASE_URL, '').replace(/[^a-z0-9]/gi, '_') || 'home';
        await page.screenshot({ path: path.join(OUTPUT_DIR, `page_${fileName}.png`), fullPage: true });
      } catch (err) {
        console.error(`Failed to crawl ${link}:`, err.message);
      }
    }

    fs.writeFileSync(path.join(OUTPUT_DIR, 'console.log'), logs.join('\n'));
    fs.writeFileSync(path.join(OUTPUT_DIR, 'failed_requests.log'), failedRequests.join('\n'));

    console.log('Crawl completed successfully.');

  } catch (error) {
    console.error('Error during crawl:', error);
  } finally {
    await browser.close();
  }
}

crawl();
