
const express = require('express')
const app = express()
const PORT = process.env.PORT || 7000
const axios = require('axios')

var auddApiKey = process.env.AUDDAPIKEY;
var urlApiKey = process.env.URLAPIKEY;

const puppeteer = require('puppeteer')

const cors = require('cors')
const origin = process.env.NODE_ENV === 'production' ? 'http://prod-url.com' : 'http://localhost:3000'
app.use(cors({ origin }))
const server = app.listen(PORT)

// ROUTES
app.get('/get-youtube-mp3-url', (req, res) => {
    console.log('scrapping youtube mp3 url');

    let youtubeUrl = req.query.youtubeUrl
    youtubeID = youtubeUrl.split('=')[1]
    
    axios({
        "method":"GET",
        "url":`https://download-video-youtube1.p.rapidapi.com/mp3/${youtubeID}`,
        "headers":{
        "content-type":"application/octet-stream",
        "x-rapidapi-host":"download-video-youtube1.p.rapidapi.com",
        "x-rapidapi-key":urlApiKey
        }
        })
        .then((response)=>{
            if (response.data.error) {
                console.log(response.data.errorMsg);
            }
            let url = response.data.vidInfo[0].stream
            console.log(url)
            res.send(url)
        })
})


app.get('/get-soundcloud-mp3-url', (req, res) => {
    console.log('scrapping soundcloud mp3 url');

    const getSong = async (soundCloudURL) => {
      const browser = await puppeteer.launch({ headless: true })
      const page = await browser.newPage()
      await page.goto('https://sclouddownloader.net')
      await page.evaluate((soundCloudURL) => {
        document.querySelector('input[name=sound-url]').value = soundCloudURL
        document.querySelector('input[type=submit]').click()
      }, soundCloudURL)
      await page.waitForNavigation()
      const linkWeWant = await page.evaluate(() => {
        return document.querySelectorAll('a[download]')[1].getAttribute('href')
      })
      await browser.close()
      res.send(linkWeWant)

    }
    getSong(req.query.soundcloudUrl)
    

})


app.get('/get-tracklist', (req, res)=> {
    let url = req.query.mp3Url
    console.log('getting tracklist');
    var options = {
        'url': url,
        'return': 'timecode,apple_music',
        'api_token': auddApiKey
    };
    axios.post("https://enterprise.audd.io/", options).then(response => {
        res.send(response.data.result)
    })
})