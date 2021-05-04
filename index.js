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

bot.on('message', async event => {
  if (event.message.type === 'text') {
    try {
      const response = await axios.get('http://www.atmovies.com.tw/movie/now/1/')
      const response2 = await axios.get('http://www.atmovies.com.tw/movie/movie_now_page2.html')

      const html = response.data + response2.data
      const $ = cheerio.load(html)

      const matches = []
      const reply = ''
      $('.filmTitle').each(function () {
        const name = $(this).find('a').text()
        const url = $(this).find('a').attr('href')
        const runTime = $(this).nextAll('.runtime').text()
        if (name.trim().toLowerCase().includes(event.message.text)) {
          matches.push({ name, url, runTime })
          const movieUrl = matches[0].url.split('/')[2]
          const movieTime = matches[0].runTime.split(' ')[2]
          const movieDate = matches[0].runTime.split(' ')[3]
          // console.log(movieDate)

          const flex = {
            type: 'bubble',
            hero: {
              type: 'image',
              url:
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8bW92aWV8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
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
                  text: `${matches[0].name}`,
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
                          text: `${movieDate}`,
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
                          text: `${movieTime}`,
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
                    uri: `http://www.atmovies.com.tw/movie/${movieUrl}/`
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
          // console.log(message)
        }
      })
      console.log(reply)
      event.reply(reply)
    } catch (error) {
      console.log(error)
      event.reply('發生錯誤')
    }
  }
})
