import * as fs from 'fs'
import * as path from 'path'
import * as nunjucks from 'nunjucks'
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

export async function welcome() {
  const targetTemplate = getToken() ? 'welcome.html' : 'link.html'
  return readConfig().then((config: any) => {
    return nunjucks.render(targetTemplate, config)
  })
  return nunjucks.render(targetTemplate)
}