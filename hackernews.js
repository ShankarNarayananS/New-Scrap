const Nightmare = require('nightmare')

let nightmare = null;

const hackernews = {

    initialize: async () => {
        nightmare = Nightmare({
            show: false 
            
        }); 
    },

    getArticles: async (limit = 30) => {
        await nightmare.goto('https://news.ycombinator.com/news');
        
        let articles = [];
        let isPagination = null;

        do {
        
            let new_articles = await nightmare.evaluate(() => {
                
                let tableRows = document.querySelectorAll('table[class="itemlist"] > tbody > tr');
                
                
                let articles = [];
                
                for(let row of tableRows) {
                    
                    if(row.getAttribute('class') == 'spacer') continue;
                    
                    if(row.getAttribute('class') == 'athing') {
                        
                        let title = row.querySelector('td[class="title"] > a').innerText;
                        let url = 	row.querySelector('td[class="title"] > a').getAttribute('href');
                        let source = row.querySelector('span[class="sitebit comhead"] > a') ?row.querySelector('span[class="sitebit comhead"] > a').innerText : false;
                        
                        let secondRow = row.nextSibling;
                        
                        let points = secondRow.querySelector('span[class="score"]') ? secondRow.querySelector('span[class="score"]').innerText : false;
                        let author = secondRow.querySelector('a[class="hnuser"]') ? secondRow.querySelector('a[class="hnuser"]').innerText : false;
                        let date = secondRow.querySelector('span[class="age"]').innerText;
                        let comments = secondRow.querySelectorAll('a')[3] ? secondRow.querySelectorAll('a')[3].innerText : false;
                        
                        articles.push({ title, url, source, points, author, date, comments });
                        
                    }
                    
                }
                
                return articles;
                
            });
 
            articles = [
                ...articles,
                ...new_articles
            ];
            
            isPagination = await nightmare.exists('a[class="morelink"]');
            
            if(isPagination && articles.length < limit) {
                await nightmare.click('a[class="morelink"]');
                await nightmare.wait('table[class="itemlist"]')
            }
        } while(articles.length < limit && isPagination);

        return articles.splice(0, limit);
        
    }
}

module.exports = hackernews;