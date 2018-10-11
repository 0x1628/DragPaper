import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as bodyParser from 'koa-bodyparser'
import * as dropbox from './dropbox'
import * as view from './view'
import * as account from './account'
import Clip from './Clip'
import {readConfig} from './tools'
import {AuthError} from './error'

const app = new Koa()
const router = new Router()

app.proxy = true
app.use(bodyParser())

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    if (!error.status) {
      throw error
    }
    if (error instanceof AuthError) {
      if (ctx.request.method.toLocaleLowerCase() !== 'get') {
        ctx.status = 404
        return
      }
      if (ctx.path === '/') {
        ctx.body = await view.login()
      } else {
        ctx.redirect('/')
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

app
  .use(router.routes())
  .use(router.allowedMethods())

const port = process.env.PORT || 7300
app.listen(port)
console.log(`App listening on port ${port}`)