import * as fetch from 'isomorphic-fetch'
import * as FormData from 'form-data'
import * as HttpsProxyAgent from 'https-proxy-agent'
import log from './log'

type string2any = {[key: string]: any}

export type HttpOptions = {
  method?: string
  body?: FormData | string2any | string | null
  headers?: string2any
  [key: string]: any
}

type HttpResponse = {
  status: number
  headers: any
  body: any
}

if (process.env.PROXY) {
  log(`use proxy ${process.env.PROXY}`)
}

function http(url: string, options: HttpOptions = {}): Promise<HttpResponse> {
  const method = options.method || 'GET'

  const finalOptions = <HttpOptions>{}
  finalOptions.method = options.method || 'GET'
  finalOptions.headers = options.headers || {}
  if (finalOptions.method.toLowerCase() !== 'get' && options.body) {
    let {body} = options
    if (finalOptions.headers['content-type'] === 'application/json') {
      finalOptions.body = typeof body === 'string' ? body : JSON.stringify(body)
    } else if (body instanceof FormData) {
      if (!finalOptions.headers['content-type']) {
        finalOptions.headers['content-type'] = 'multipart/form-data'
      }
      finalOptions.body = body
    } else {
      if (!finalOptions.headers['content-type']) {
        finalOptions.headers['content-type'] = 'application/x-www-form-urlencoded'
      }
      if (body instanceof Map || body instanceof Set) {
        body = Array.from(body).reduce((target, [key, value]) => {
          target[key] = value
          return target
        }, {})
      }

      if (typeof body === 'object') {
        finalOptions.body = Object.keys(body).reduce((target, key) => {
          target.push(`${key}=${(<any>body)[key]}`)
          return target
        }, <string[]>[]).join('&')
      } else {
        finalOptions.body = options.body
      }
    }
  }

  if (typeof document === 'undefined' && typeof process.env.PROXY !== 'undefined') {
    finalOptions['agent'] = new HttpsProxyAgent(process.env.PROXY)
  }

  return fetch(url, {
    ...finalOptions,
    body: <any>finalOptions.body,
  }).then((res: any) => {
    if (res.status < 300) {
      return res.json()
        .catch(() => res.text())
        .then((body: any) => {
          return {
            status: res.status,
            headers: res.headers,
            body,
          }
        })
    } else {
      return res.text().then((text: string) => {
        return Promise.reject({
          status: res.status,
          headers: res.headers,
          body: text,
        })
      })
    }
  })
}

export default http