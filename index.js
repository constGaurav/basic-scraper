import puppeteer from "puppeteer";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = "https://support.zuddl.com";

async function scrapeArticles() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(BASE_URL);

  const articleLinks = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a.article-link")).map(a => a.href)
  );

  let articles = [];

  for (const link of articleLinks) {
    console.log(`Scraping: ${link}`);
    await page.goto(link);
    await page.waitForSelector("h1");

    const article = await page.evaluate(() => ({
      title: document.querySelector("h1")?.innerText,
      content: document.querySelector("article")?.innerText,
      url: window.location.href
    }));

    articles.push(article);
  }

  await browser.close();

  fs.writeFileSync("knowledge_base.json", JSON.stringify(articles, null, 2));
  console.log("Scraping complete. Data saved to knowledge_base.json");
}

scrapeArticles();
