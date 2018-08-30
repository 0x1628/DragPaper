import {IRouterContext} from 'koa-router'
import {readConfig, md5} from './tools'

export function login(ctx: IRouterContext) {
  return readConfig().then((config: any) => {
    const {account} = config
    const {body} = <any>ctx.request
    if (account.username !== body.username) {
      return ctx.redirect('/')
    }
    if (account.password !== md5(body.password)) {
      return ctx.redirect('/')
    }
    ctx.cookies.set('st', account.password, {
      httpOnly: true,
    })
    ctx.redirect('/')
  })
}