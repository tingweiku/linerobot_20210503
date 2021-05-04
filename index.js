import linebot from 'linebot'
import dotenv from 'dotenv'
import axios from 'axios'
import cheerio from 'cheerio'

// 讓套件讀取 .env 檔案
// 讀取後可以使用 process.env.變數 使用
dotenv.config()

const bot = linebot({
  channelId: process.env.CHANNEL_ID,
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

bot.listen('/', process.env.PORT, () => {
  console.log('機器人啟動')
})

bot.on('message', async event => {
  if (event.message.type === 'text') {
    try {
      const response = await axios.get('http://www.atmovies.com.tw/movie/now/1/')
      const $ = cheerio.load(response.data)
      const matches = []
      let reply = ''
      $('.filmTitle').each(function () {
        const name = $(this).find('a').text()
        const url = $(this).find('a').attr('href')
        if (name.trim().toLowerCase().includes(event.message.text)) {
          matches.push({ name, url })
          const movieUrl = matches[0].url.split('/')[2]
          // console.log(movieUrl)
        }
      })
      // for (const match of matches) {
      //   const response2 = await axios.get('http://www.atmovies.com.tw/movie/now/1/')
      // }
      console.log(reply)
      event.reply(reply)
    } catch (error) {
      console.log(error)
      event.reply('發生錯誤')
    }
  }
})
