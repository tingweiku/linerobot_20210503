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
      const response = await axios.get('http://www.atmovies.com.tw/movie/now/')
      const $ = cheerio.load(response.data)
      let reply = ''
      $('.filmListPA li a').each(function () {
        reply += $(this).text() + '\n'
      })
      console.log(reply)
      event.reply(reply)
    } catch (error) {
      event.reply('發生錯誤')
    }
  }
})
