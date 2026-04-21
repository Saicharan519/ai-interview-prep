import puppeteer from 'puppeteer';

export async function generatePDF(htmlContent) {
  let browser;
  try {
    // Launch browser with sandbox disabled for Linux/Docker compatibility
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set page content with network idle wait
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    // Generate PDF with A4 format and margins
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    });

    return pdfBuffer;
  } finally {
    // Always close browser to prevent memory leaks
    if (browser) {
      await browser.close();
    }
  }
}
