import {IRouterContext} from 'koa-router'
import {readConfig, md5} from './tools'

export function login(ctx: IRouterContext) {
  return readConfig().then((config: any) => {
    const {account} = config
    const {body} = <any>ctx.request
    ctx.set('content-type', 'application/json')
    if (account.username !== body.username) {
      return ctx.body = {code: 1001, err: 'username or password not match'}
    }
    if (account.password !== md5(body.password)) {
      return ctx.body = {code: 1001, err: 'username or password not match'}
    }
    ctx.cookies.set('st', account.password, {
      httpOnly: true,
    })
    ctx.body = {code: 0}
  })
}