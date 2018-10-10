import * as read from 'node-readability'
import * as sanitize from 'sanitize-html'
import http from './http'
import log from './log'
import {addLineForBlock} from './beautifiers'

class Clip {
  content = ''
  constructor(protected url: string) {}

  processors = ['clean', 'beautify']

  getHost(url: string) {
    return url.replace(/https?:\/\/(.+?\.)?(.+?)\.\w+\/?.*/, '$2')
  }

  async fetchPage(): Promise<string> {
    log(`begin fetch url ${this.url}`)
    return http(this.url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
      },
    }).then((res): Promise<string> => {
      log(`url ${this.url} fetched`)
      return new Promise((resolve) => {
        let content = res.body
        const preprocessType = this.getHost(this.url)
        if (preprocessType) {
          try {
            let preproccessor = require(`./preprocessors/${preprocessType}`)
            if (preproccessor.default) {
              preproccessor = preproccessor.default
            }
            content = preproccessor(content, this.url)
          } catch (e) {}
        }

        read(content, (err: any, article: any, meta: any) => {
          if (err) {
            throw err
          }
          this.content = article.content
          this.processors.forEach(pName => {
            const processor = (<any>this)[pName]
            if (processor) {
              this.content = processor.call(this, this.content, article.title)
            }
          })
          resolve(this.content)
        })
      })
    })
  }

  clean(html: string, title: string): string {
    html = `<h1>${title}</h1><p>${this.url}</p>${html}`
    html = sanitize(html, {
      allowedTags: false,
    })
    const cleanerType = this.getHost(this.url)
    if (cleanerType) {
      try {
        let cleaner = require(`./cleaners/${cleanerType}`)
        if (cleaner.default) {
          cleaner = cleaner.default
        }
        html = cleaner(html, this.url)
      } catch(e) {}
    }

    return html
  }

  beautify(html: string) {
    return addLineForBlock(html)
  }

  getContent() {
    return this.content
  }
}

export default Clip