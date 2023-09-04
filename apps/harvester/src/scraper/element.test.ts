import puppeteer from "puppeteer"

it ('Correctly finds elements', async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    page.goto("https://www.wikipedia.org/");

    await page.waitForSelector("#searchInput")
    
})