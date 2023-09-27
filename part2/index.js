const puppeteer = require("puppeteer");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

// - the fgiven url
const baseUrl = "http://books.toscrape.com/";

const getBooks = async () => {
  // Start a Puppeteer session with:
  // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
  // - no default viewport (`defaultViewport: null` - website page will in full width and height)
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  // Open a new page
  const page = await browser.newPage();
  // Create a SQLite database
  const db = new sqlite3.Database("books.db");
  db.serialize(() => {
    db.run(
      "CREATE TABLE IF NOT EXISTS books (title TEXT, imageURL TEXT, stock TEXT, price TEXT, rating TEXT )"
    );
  });

  // Loop through all 50 pages
  for (let pageNumber = 1; pageNumber <= 50; pageNumber++) {
    const url = `http://books.toscrape.com/catalogue/page-${pageNumber}.html`;

    // On this new page:
    // - open the "http://books.toscrape.com/" website
    // - wait until the dom content is loaded (HTML is ready)
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });

    // Get page data
    const bookData = await page.evaluate((url) => {
      // Fetch the first element with class "product_pod"
      // Get the displayed Details and returns it
      const productPots = Array.from(document.querySelectorAll(".product_pod"));
      const booksDataArray = [];

      const bookDetails = productPots.map((book) => {
        const title = book.querySelector("h3 a").getAttribute("title");
        const imageURL =
          url +
          book
            .querySelector(".image_container a img")
            .getAttribute("src")
            .substring(3);
        const price = book.querySelector(".price_color").innerText;
        const stock = book.querySelector(".instock").textContent.trim();

        const rating = book.querySelector(".star-rating").classList[1];

        booksDataArray.push({ title, imageURL, price, stock, rating });

        return booksDataArray;
      });

      return bookDetails;
    }, baseUrl);
    // To print the Data in the console uncomment the next line
    // console.log(bookData);

    fs.writeFile("booksData.json", JSON.stringify(bookData), (err) => {
      if (err) {
        console.log(err);
      }
      console.log("Success");
    });

    db.close((err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log("Data scraped and stored successfully.");
    });
  }
  await browser.close();
};

getBooks();
