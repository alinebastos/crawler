const puppeteer = require('puppeteer');
const fs = require('fs');

const siteUrl = 'https://www.empiricus.com.br/conteudo/newsletters';

async function run() {  
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(siteUrl);

  let { newsletter, json } = createJson();

  for (let h = 1; h <= 10; h++) {
    let pageUrl = siteUrl + '/page/' + h;  
    await page.goto(pageUrl);

    let listLength = await page.evaluate(() => {
      return document.getElementsByClassName("list-item").length;
    });

    for(let i = 1; i < listLength ; i++) {
      let [date, title] = await page.evaluate((i) => {
        return [
          document.getElementsByClassName("list-item--info")[i] !== null ? document.getElementsByClassName("list-item--info")[i].textContent.replace(/^\D+/g, "") : "",
          document.getElementsByClassName("list-item--title")[i] !== null ? document.getElementsByClassName("list-item--title")[i].textContent.trim() : ""
        ]
      },  i);

      let str = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/\u2013/g, 'ndash').replace(/\u2026/g, "and-8230-").replace(/\W/g, "-").replace(/\-{2,}/g, '-');
      let url = await page.evaluate((str) => {
        const item = document.querySelector(`#btn_post-${str}`);
        return !item ? '' : item.href
      }, str);

      const articlePage = await browser.newPage();
      await articlePage.goto(url);

      let [image, description, body] = await articlePage.evaluate((a, b, c) => {
        return [
          document.querySelector(a).getAttribute("src"),
          document.querySelector(b) !== null ? document.querySelector(b).textContent.trim() : "",
          document.querySelector(c).innerHTML
        ]
      }, '#article-content > section.article--main-image > img', "#article-content > header > h2", "#article-content > section.article--content")
      
      articlePage.close();
      
      let { articleDate, last30Days } = getDates(date);

      if(new Date(articleDate) > last30Days) {
        writeJson(url, date, title, description, image, body);
      } else {
        process.exit();
      }
    }
  }  
  browser.close();
}
run();

function createJson() {
  let newsletter = {
    articles: []
  };
  newsletter.articles.push({
    url: "url",
    date: "date",
    title: "title",
    description: "description",
    image: "image",
    body: "body"
  });
  let json = JSON.stringify(newsletter);
  fs.writeFileSync('newsletter.json', json, 'utf8');
  return { newsletter, json };
}

function getDates(date) {
  let today = new Date();
  let last30Days = new Date().setDate(today.getDate() - 30);
  let articleDate = date.replace(/(\d+)\s\w{2}\s([\D]+)?\,\s(\d{4})/g, formatDt);
  function formatDt(all, g1, g2, g3) {
    const arr = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const month = arr.indexOf(g2) + 1;
    return `${g3}-${month > 9 ? month : '0' + month}-${g1}`;
  }
  return { articleDate, last30Days };
}

function writeJson(url, date, title, description, image, body) {
  fs.readFile('newsletter.json', 'utf8', function readFileCallback(err, data) {
    if (err) {
      console.log(err);
    }
    else {
      newsletter = JSON.parse(data);
      newsletter.articles.push({
        url: url,
        date: date,
        title: title,
        description: description,
        image: image,
        body: body
      });
      json = JSON.stringify(newsletter, null, 2);
      fs.writeFileSync('newsletter.json', json, 'utf8');
    }
  });
}