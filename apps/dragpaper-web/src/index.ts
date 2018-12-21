import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as bodyParser from 'koa-bodyparser'
import * as serve from 'koa-static'
import * as path from 'path'
import {URL} from 'url'
import {Duplex} from 'stream'
import * as dropbox from './dropbox'
import * as view from './view'
import * as account from './account'
import Clip from './Clip'
import {readConfig, queryToJSON} from './tools'
import {AuthError} from './error'

const app = new Koa()
const router = new Router()

app.proxy = true
app.use(bodyParser())
app.use(serve(path.resolve(__dirname, '..', 'static')))

app.use(async (ctx, next) => {
  try {
    if (ctx.request.headers['referer']) {
      const referer = new URL(ctx.request.headers['referer'])
      ctx.set('access-control-allow-credentials', 'true')
      ctx.set('access-control-allow-origin', `${referer.protocol}//${referer.host}`)
    }
    await next()
  } catch (error) {
    if (!error.status) {
      throw error
    }
    if (error instanceof AuthError) {
      if (ctx.path === '/') {
        ctx.body = await view.login()
      } else {
        ctx.status = 403
        return
      }
    } else {
      console.log(error)
    }
  }
})

router.use((ctx, next) => {
  const path = ctx.path.slice(1)

  if (["login"].includes(path)) {
    return next()
  }

  const st = ctx.cookies.get('st')
  if (!st) {
    throw new AuthError()
  }
  return readConfig().then((config: any) => {
    if (config.account.password !== st) {
      throw new AuthError()
    }
    return next()
  })
})

router
  .post('/login', account.login)
  .get('/oauth_callback', (ctx) => {
    return dropbox.oauthAndCheck(ctx)
  })
  .get('/', async (ctx) => {
    await dropbox.check(ctx)
    ctx.body = await view.welcome(ctx.request)
  })
  .get('/save/markdown', async (ctx) => {
    await dropbox.saveMarkDown('# Hello World\n\nhahaha')
    ctx.body = 'done'
  })
  .get('/save/webpage', async (ctx) => {
    if (!ctx.query.t || !/^https?:\/\/.+/.test(ctx.query.t)) {
      ctx.status = 404
      return
    }
    try {
      const content = await new Clip(ctx.query.t).fetchPage()
      const result = await dropbox.saveHTML(content)
      ctx.set('content-type', 'application/json')
      ctx.body = result
    } catch (e) {
      console.log(e)
      ctx.status = 500
    }
  })
  .get('/share', async (ctx) => {
    const stream = new Duplex()
    ctx.status = 200
    ctx.res.setHeader('Content-Type', 'text/html; charset=utf-8')
    ctx.res.setHeader('Connection', 'Transfer-Encoding')
    ctx.res.setHeader('Transfer-Encoding', 'chunked')
    ctx.res.write(await view.share())
    const searchObj = queryToJSON(ctx.request.url)
    let targetUrl = ''
    Object.values(searchObj).some(value => {
      if (/^https?:\/\//.test(value)) {
        targetUrl = value
        return true
      }
      const result = value.match(/(https?:\/\/\S+)( |$)/)
      if (result) {
        targetUrl = result[1]
        return true
      }
      return false
    })

    function end(url: string, success: boolean) {
      ctx.res.write(`<script>var saveResult = {url: '${url}', success: ${success}}</script>`)
      ctx.res.write('<script src="./share.js"></script>')
      ctx.res.end()
    }

    if (!targetUrl) {
      end(targetUrl, false)
      return
    }
    try {
      const content = await new Clip(targetUrl).fetchPage()
      await dropbox.saveHTML(content)
      end(targetUrl, true)
    } catch (e) {
      end(targetUrl, false)
    }
  })

app
  .use(router.routes())
  .use(router.allowedMethods())

const port = process.env.PORT || 7300
app.listen(port)
console.log(`App listening on port ${port}`)