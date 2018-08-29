import * as fetch from 'isomorphic-fetch'
import * as FormData from 'form-data'
import * as HttpsProxyAgent from 'https-proxy-agent'

type string2any = {[key: string]: any}

export type HttpOptions = {
  method?: string
  body?: FormData | string2any | string
  headers?: HeadersInit
} | string2any

type HttpResponse = {
  status: number
  headers: any
  body: any
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
          target.push(`${key}=${body[key]}`)
          return target
        }, []).join('&')
      } else {
        finalOptions.body = options.body
      }
    }
  }

  if (typeof document === 'undefined' && typeof process.env.PROXY !== 'undefined') {
    console.log(`use proxy ${process.env.PROXY}`)
    finalOptions['agent'] = new HttpsProxyAgent(process.env.PROXY)
  }

  return fetch(url, {
    ...finalOptions,
    body: finalOptions.body,
  }).then((res) => {
    if (res.status < 300) {
      return res.json()
        .catch(() => res.text())
        .then((body) => {
          return {
            status: res.status,
            headers: res.headers,
            body,
          }
        })
    } else {
      return res.text().then((text) => {
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