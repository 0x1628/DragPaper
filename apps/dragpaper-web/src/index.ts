import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as fetch from 'isomorphic-fetch'
import * as FormData from 'form-data'
import * as HttpsProxyAgent from 'https-proxy-agent'
console.log(process.env.PROXY)
const app = new Koa()
const router = new Router()

router
  .get('/', (ctx) => {
    ctx.body = 'Hello world'
  })
  .get('/oauth_callback', (ctx) => {
    // test url
    // https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=8tbewlgh2d2c289&redirect_uri=http%3A%2F%2Flocalhost%3A7300%2Foauth_callback

    console.log(ctx.query.code)
    const data = new FormData()
    data.append('code', ctx.query.code)
    data.append('grant_type', 'authorization_code')
    data.append('client_id', '8tbewlgh2d2c289')
    data.append('client_secret', 'a0bk1f80bgabggx')
    data.append('redirect_uri', 'http://localhost:7300/oauth_callback')

    const options = <any>{}
    if (process.env.PROXY === 'true') {
      options.agent = new HttpsProxyAgent('http://127.0.0.1:8123')
    }
    
    fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      body: {
        code: ctx.query.code,
        grant_type: 'authorization_code',
        client_id: '8tbewlgh2d2c289',
        client_secret: 'a0bk1f80bgabggx',
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      ...options,
    }).then((res) => {
      if (res.status < 300) {
        res.json().then((body) => {
          console.log(res.status, body)
        })
      } else {
        res.text().then((text) => {
          console.log('error', res.status, text)
        })
      }
    })
  })

app
  .use(router.routes())
  .use(router.allowedMethods())

const port = process.env.PORT || 7300
app.listen(port)
console.log(`App listening on port ${port}`)