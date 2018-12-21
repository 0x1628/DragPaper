import * as fs from 'fs'
import * as path from 'path'
import * as nunjucks from 'nunjucks'
import {Request} from 'koa'
import {getToken} from './dropbox'
import {readConfig, getRequestInfo} from './tools'

const base = path.resolve(process.cwd(), 'view')
nunjucks.configure(base, {
  autoescape: true,
  watch: true,
})

export async function login() {
  return nunjucks.render('login.html')
}

export async function share() {
  return nunjucks.render('share.html')
}

export async function welcome(req: Request) {
  const targetTemplate = getToken() ? 'welcome.html' : 'link.html'
  return readConfig().then((config: any) => {
    const {root, host, protocol} = getRequestInfo(req)
    return nunjucks.render(targetTemplate, {
      ...config,
      host,
      protocol,
      root,
    })
  })
}