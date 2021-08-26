const puppeteer = require('puppeteer');
const fs = require('fs');

const scrape_wiki = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://en.wikipedia.org/wiki/COVID-19_pandemic_by_country_and_territory", { waitUntil: "domcontentloaded" });

    const result = await page.evaluate(() => {
        const rows = document.querySelectorAll('div#covid19-container table#thetable tbody tr');

        return Array.from(rows, row => {

            var countries = row.querySelectorAll('a');
            var columns = row.querySelectorAll('td');

            var count_array = Array.from(countries, c => c.innerText);
            var cols_array = Array.from(columns, column => column.innerText);

            var result = [];
            for (var i = 0; i < count_array.length; i++) {
                let record = { 'country': '', 'cases': '', 'death': '', 'recovered': '' };
                if (cols_array[1] != null && (!count_array[i].includes('[') && !count_array[i].includes(']'))) {
                    record.country = count_array[i];
                    record.cases = cols_array[0];
                    record.death = cols_array[1];
                    record.recovered = cols_array[2];

                    result.push(record);
                }
            }

            return result;
        });
    });

    fs.writeFile('virus.json', JSON.stringify(result, null, 2), err => {
        if (err)
            console.error(err);
        else
            console.log('Saved!');
    });

    browser.close();

}
scrape_wiki();
