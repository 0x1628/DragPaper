import {IRouterContext} from 'koa-router'
import * as fs from 'fs'
import * as path from 'path'
import http, { HttpOptions } from './http'
import {readConfigSync, readConfig, writeConfig} from './tools'
import TempFile from './TempFile'
import log from './log'

type string2string = {[key: string]: string}
const dropboxConfig = readConfigSync().dropbox
const tokenFile = path.resolve(process.cwd(), dropboxConfig.tokenFile || '.token')
let token: string = ''
try {
  if (fs.statSync(tokenFile).isFile()) {
    token = fs.readFileSync(tokenFile).toString()
  }
} catch (e) {}

export function getToken() {
  return token
}

if (!dropboxConfig.email) {
  throw new Error('Must config dropbox email')
  process.exit(1)
}


function oauth(code: string): Promise<any>
function oauth(ctx: IRouterContext): Promise<any>
function oauth(ctx: any): Promise<any> {
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

  log(`start oauth with code ${code}`)
  return http('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    body: data,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  }).then((res) => {
    log('oauth success')
    token = res.body.access_token
    if (typeof ctx !== 'string') {
      ctx.body = 'ok'
      return null
    } else {
      return res
    }
  }).catch((res) => {
    if (typeof ctx !== 'string') {
      ctx.body = 'error'
      return null
    } else {
      throw res
    }
  })
}

export {oauth}

function dttp(url: string, options: any = {}) {
  options = {...options}
  if (!url.startsWith('http')) {
    url = `https://api.dropboxapi.com/2${url.startsWith('/') ? '' : '/'}${url}`
  }
  options.method = options.method || 'POST'
  options.headers = {...options.headers}
  if (options.body && !options.headers['content-type']) {
    options.headers['content-type'] = 'application/json'
  }
  if (options.arg) {
    options.headers['dropbox-api-arg'] = typeof options.arg === 'string' ?
      options.arg : JSON.stringify(options.arg)
    delete options.arg
  }
  options.headers['authorization'] = `Bearer ${token}`
  return http(url, options)
}

export function oauthAndCheck(ctx: IRouterContext) {
  log('start oauth and check')
  return oauth(ctx.query.code).then((res: any) => {
    const {access_token: accessToken, account_id: accountId} = res.body
    return check(ctx).then(() => {
      return new Promise((resolve) => {
        const tokenFile = path.resolve(process.cwd(), dropboxConfig.tokenFile || '.token')
        fs.writeFile(tokenFile, accessToken, (err) => {
          log('token file writed')
          if (err) {
            console.log(err)
          }
          ctx.redirect('/')
          resolve()
        })
      })
    }).catch((res) => {
      console.log(res)
      ctx.body = 'error'
    })
  })
}

export function check(ctx: IRouterContext) {
  log('start check account')
  return dttp('/users/get_current_account').then((res): Promise<any> => {
    log('check account success')
    const {email} = res.body
    if (dropboxConfig.email !== email) {
      ctx.body = 'Dropbox email unmatched.'
      return Promise.reject()
    }
    return Promise.resolve(res)
  }, (e) => {
    log(`check account fail: ${e.status}`)
    if (e.status === 400) {
      return new Promise((resolve) => {
        token = ''
        fs.unlink(tokenFile, (err) => {
          resolve()
        })
      })
    } else {
      throw e
    }
  })
}

export function saveMarkDown(str: string) {
  log('start save markdown')
  return dttp('/paper/docs/create', {
    arg: {
      import_format: 'markdown',
      parent_folder_id: dropboxConfig.folder,
    },
    headers: {
      'content-type': 'application/octet-stream',
    },
    body: fs.createReadStream(path.resolve(process.cwd(), 'temp.md')),
  }).then((res) => {
    console.log(res)
  })
}

export function saveHTML(str: string) {
  log('start save html')
  const file = new TempFile(str)
  return file.save().then(() => {
    return dttp('/paper/docs/create', {
      arg: {
        import_format: 'html',
        parent_folder_id: dropboxConfig.folder,
      },
      headers: {
        'content-type': 'application/octet-stream',
      },
      body: fs.createReadStream(file.getFilePath()),
    })
  }).then(() => {
    console.log(233)
    file.destroy()
  }).catch((e) => {
    file.destroy()
    console.log(e)
  })
}