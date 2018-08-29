import {IRouterContext} from 'koa-router'
import http, { HttpOptions } from './http'
import {readConfigSync, readConfig, writeConfig} from './tools'

type string2string = {[key: string]: string}
const dropboxConfig = readConfigSync().dropbox

if (!dropboxConfig.email) {
  throw new Error('Must config dropbox email')
  process.exit(1)
}

function oauth(code: string)
function oauth(ctx: IRouterContext)
function oauth(ctx: any) {
  // test url
  // https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=8tbewlgh2d2c289&redirect_uri=http%3A%2F%2Flocalhost%3A7300%2Foauth_callback
  
  let code = ctx
  if (typeof code !== 'string') {
    code = ctx.query.code
  }

  const data = new Map
  data.set('code', code)
  data.set('grant_type', 'authorization_code')
  data.set('client_id', '8tbewlgh2d2c289')
  data.set('client_secret', 'a0bk1f80bgabggx')
  data.set('redirect_uri', 'http://localhost:7300/oauth_callback')
  
  return http('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    body: data,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  }).then((res) => {
    dropboxConfig.accessToken = res.body.access_token
    readConfig().then((data: any) => {
      data = {
        ...data,
        dropbox: {
          ...data.dropbox,
          ...dropboxConfig,
        }
      }
      writeConfig(data)
    })
    if (typeof ctx !== 'string') {
      ctx.body = 'ok'
      return null
    } else {
      return res
    }
  }).catch((res) => {
    console.error(res.status, res.body)
    if (typeof ctx !== 'string') {
      ctx.body = 'error'
      return null
    } else {
      throw res
    }
  })
}

export {oauth}

function dttp(url: string, options: HttpOptions = {}) {
  if (!url.startsWith('http')) {
    url = `https://api.dropboxapi.com/2${url.startsWith('/') ? '' : '/'}${url}`
  }
  options.headers = {...options.headers}
  options.headers['content-type'] = 'application/json'
  options.headers['authorization'] = `Bearer ${dropboxConfig.accessToken}`
  return http(url, options)
}

export function oauthAndCheck(ctx: IRouterContext) {
  return oauth(ctx.query.code).then((res: any) => {
    const {access_token: accessToken, account_id: accountId} = res.body
    return dttp(`/users/get_account`, {
      method: 'POST',
      body: {
        account_id: accountId,
      },
    }).then((res) => {
      const {email} = res.body
    }).catch((res) => {
      console.log(res)
      ctx.body = 'error'
    })
  })
}