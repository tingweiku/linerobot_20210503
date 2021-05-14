import linebot from 'linebot'
import dotenv from 'dotenv'
import axios from 'axios'
import cheerio from 'cheerio'
import fs from 'fs'
import schedule from 'node-schedule'

const data = []
const getHTML = async () => {
  for (let i = 1; i <= 15; i++) {
    const response = await axios.get(`https://movies.yahoo.com.tw/movie_intheaters.html?page=${i}`)
    const response2 = await axios.get('https://movies.yahoo.com.tw/movie_thisweek.html')

    const html = response.data + response2.data

    data.push(cheerio.load(html))
  }
  console.log('資料更新完成')
}

schedule.scheduleJob('* * 0 * * *', () => {
  getHTML()
})

getHTML()

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
      for (const $ of data) {
        $('.release_info').each(function () {
          const name = $(this).find('.release_movie_name').find('a').eq(0).text().trim()
          const engName = $(this).find('.release_movie_name').find('a').eq(1).text().trim()
          const img = $(this).prev().find('img').attr('src')
          const movieDate = $(this).find('.release_movie_time').text()
          const timeTableUrl = $(this).find('.btn_s_time').attr('href')
          const trailerUrl = $(this).find('.btn_s_vedio').attr('href')
          const movieUrl = $(this).find('.release_movie_name').find('a').eq(0).attr('href')
          if (name.trim().includes(event.message.text) || engName.trim().toLowerCase().includes(event.message.text.trim().toLowerCase())) {
            const flex = {
              type: 'bubble',
              hero: {
                type: 'image',
                url: `${img}`,
                size: 'full',
                aspectRatio: '20:28',
                aspectMode: 'cover',
                action: {
                  type: 'uri',
                  uri: `${movieUrl}`
                }
              },
              body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: `${name}`,
                    weight: 'bold',
                    size: 'xl'
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'text',
                        text: `${engName}`,
                        weight: 'bold',
                        size: 'md'
                      }
                    ],
                    flex: 5,
                    margin: 'md',
                    spacing: 'sm'
                  },
                  {
                    type: 'box',
                    layout: 'vertical',
                    margin: 'md',
                    spacing: 'sm',
                    contents: [
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                          {
                            type: 'text',
                            text: `${movieDate}`,
                            flex: 5,
                            size: 'sm',
                            color: '#666666'
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
                      label: '預告片',
                      uri: `${trailerUrl}`
                    }
                  },
                  {
                    type: 'button',
                    style: 'link',
                    height: 'sm',
                    action: {
                      type: 'uri',
                      label: '時刻表',
                      uri: `${timeTableUrl}`
                    }
                  }
                ],
                flex: 0
              }
            }

            const message = {
              type: 'flex',
              altText: `${name}時刻表`,
              contents: {
                type: 'carousel',
                contents: [flex]
              }
            }

            fs.writeFileSync('f.json', JSON.stringify(message, null, 2))
            event.reply(message)
          }
        })
      }
    } catch (error) {
      console.log(error)
      event.reply('發生錯誤')
    }
  }
})
