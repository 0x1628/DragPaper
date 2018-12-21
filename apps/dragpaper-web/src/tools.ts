import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import {Request} from 'koa'

const configFile = path.resolve(process.cwd(), 'config.json')
let config:any = null

export function readConfigSync(refresh = false) {
  if (!refresh && config) { return config }
  config = JSON.parse(fs.readFileSync(configFile).toString())
  return config
}

export function readConfig(refresh = false) {
  return new Promise((resolve) => {
    if (!refresh && config) { resolve(config) }
    fs.readFile(configFile, (err, data) => {
      config = JSON.parse(data.toString())
      resolve(config)
    })
  })
}

export function writeConfig(data: any) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data, null, 2)
  }
  return new Promise((resolve) => {
    fs.writeFile(configFile, data, () => {
      resolve()
    })
  })
}

export function md5(str: string) {
  const hash = crypto.createHash('md5')
  hash.update(str)
  return hash.digest('hex')
}

export function getRequestInfo(req: Request) {
  let root: string = req.header['x-forwarded-root'] || '/'
  if (!root.endsWith('/')) {
    root = `${root}/`
  }

  return {
    host: req.host,
    root,
    path: req.path.slice(1),
    hostname: req.hostname,
    protocol: req.protocol,
  }
}

export function queryToJSON(url: string) {
  const urlObj = new URL(url, 'http://whatever')
  const {searchParams} = urlObj
  const result: {[k: string]: string} = {}
  searchParams.forEach((v, k) => {
    result[k] = decodeURIComponent(v)
  })
  return result
}