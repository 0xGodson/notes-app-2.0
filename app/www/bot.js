const puppeteer = require("puppeteer");

const URL = "http://127.0.0.1";

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

async function visit(url) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    // Create a note with a flag
    await page.goto(`${URL}/create`);
    await delay(1000);

    // Click submit button
    await page.evaluate(() => {
      try {
        document.getElementsByName("title")[0].value = "FLAG";
        document.getElementsByName("body")[0].value = "INTIGRITI{f4k3}"; // update this
        document.getElementById("note-submit").click();
      } catch (e) {
        console.log("Error inside page.evaluate():", e);
      }
    });

    await delay(1000);

    // Visit the user input URL
    await page.goto(url);
    // wait for 5 secs
    await delay(8000);

    await page.close();
    await browser.close();

    return true;
  } catch (e) {
    try {
      await page.close();
      await browser.close();
    } catch {}
    console.log(e);
    return false;
  }
}

module.exports = visit;
