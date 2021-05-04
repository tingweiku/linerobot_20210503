import linebot from 'linebot'
import dotenv from 'dotenv'
import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'

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

const flex = {
  type: 'bubble',
  hero: {
    type: 'image',
    url: 'https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png',
    size: 'full',
    aspectRatio: '20:13',
    aspectMode: 'cover',
    action: {
      type: 'uri',
      uri: 'http://linecorp.com/'
    }
  },
  body: {
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        type: 'text',
        text: '一級任務 Voyagers',
        weight: 'bold',
        size: 'xl'
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'lg',
        spacing: 'sm',
        contents: [
          {
            type: 'box',
            layout: 'baseline',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '上映日期：4/29/2021',
                wrap: true,
                color: '#666666',
                size: 'sm',
                flex: 5
              }
            ]
          },
          {
            type: 'box',
            layout: 'baseline',
            spacing: 'sm',
            contents: [
              {
                type: 'text',
                text: '片長：107分',
                wrap: true,
                color: '#666666',
                size: 'sm',
                flex: 5
              }
            ]
          }
        ]
      }
    ]
  },
  footer: {
    type: 'box',
    layout: 'vertical',
    spacing: 'sm',
    contents: [
      {
        type: 'button',
        style: 'link',
        height: 'sm',
        action: {
          type: 'uri',
          label: '時刻表查詢',
          uri: 'http://www.atmovies.com.tw/movie/fven49664108/'
        }
      },
      {
        type: 'spacer',
        size: 'sm'
      }
    ],
    flex: 0
  }
}

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

          const message = {
            type: 'flex',
            altText: `${matches[0].name}時刻表`,
            contents: {
              type: 'carousel',
              contents: [flex]
            }
          }

          fs.writeFileSync('f.json', JSON.stringify(message, null, 2))
          event.reply(message)
          console.log(message)
        }
      })
      // for (const match of matches) {
      //   const response2 = await axios.get('http://www.atmovies.com.tw/movie/now/1/')
      // }
      // console.log(reply)
      // event.reply(reply)
    } catch (error) {
      console.log(error)
      event.reply('發生錯誤')
    }
  }
})
