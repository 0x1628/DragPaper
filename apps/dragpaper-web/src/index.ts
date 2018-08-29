import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as dropbox from './dropbox'
import * as view from './view'
import * as account from './account'
import {readConfig} from './tools'
import {AuthError} from './error'

const app = new Koa()
const router = new Router()

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    if (!error.status) {
      throw error
    }
    console.log(error)
    if (error.status === 403) {
      ctx.body = await view.login()
    }
  }
})

router.use((ctx, next) => {
  console.log(router)
  const st = ctx.cookies.get('st')
  if (!st) {
    throw new AuthError()
  }
  return readConfig().then((config: any) => {
    if (config.account !== st) {
      throw new AuthError()
    }
    ctx.body = view.welcome()
    console.log(config.account)
  })
})

router
  .post('/login', account.login)
  .get('/oauth_callback', (ctx) => {
    return dropbox.oauthAndCheck(ctx)
  })
  .get('/', (ctx) => {
    ctx.body = 'Hello world'
  })

app
  .use(router.routes())
  .use(router.allowedMethods())

const port = process.env.PORT || 7300
app.listen(port)
console.log(`App listening on port ${port}`)