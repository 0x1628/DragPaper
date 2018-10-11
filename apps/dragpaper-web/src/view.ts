import * as fs from 'fs'
import * as path from 'path'
import * as nunjucks from 'nunjucks'
import {Request} from 'koa'
import {getToken} from './dropbox'
import {readConfig} from './tools'

const base = path.resolve(process.cwd(), 'view')
nunjucks.configure(base, {
  autoescape: true,
  watch: true,
})

export async function login() {
  return nunjucks.render('login.html')
}

export async function welcome(req: Request) {
  const targetTemplate = getToken() ? 'welcome.html' : 'link.html'
  return readConfig().then((config: any) => {
    let root = req.header['x-forwarded-path'] || req.path
    if (!root.endsWith('/')) {
      root = `${root}/`
    }
    return nunjucks.render(targetTemplate, {
      ...config,
      host: req.host,
      protocol: req.protocol,
      root,
    })
  })
}