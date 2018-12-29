import * as read from 'node-readability'
import * as sanitize from 'sanitize-html'
import {juice} from 'html-juicer'
import http from './http'
import log from './log'
import {addLineForBlock} from './beautifiers'

export interface ReadResult {
  content: string
  title: string
}

export const asyncReadability = async (html: string, url?: string): Promise<ReadResult> => {
  return new Promise<ReadResult>((resolve, reject) => {
    const result = juice(html, {
      href: url || '',
    })
    resolve({
      content: result.content,
      title: result.title,
    })
  })
}

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
    }).then(async (res): Promise<string> => {
      log(`url ${this.url} fetched`)
      let html = res.body
      const preprocessType = this.getHost(this.url)

      let customProcessor = null
      try {
        customProcessor = require(`./custom-processors/${preprocessType}`)
      } catch (e) { }
      if (customProcessor && customProcessor.replacer) {
        html = customProcessor.replacer(html, this.url)
      }
      const readMethod: typeof asyncReadability = (customProcessor && customProcessor.read) || asyncReadability
      let {content, title} = await readMethod(html, this.url)
      this.processors.forEach(pName => {
        const processor = (<any>this)[pName]
        if (processor) {
          content = processor.call(this, content, title)
        }
      })

      this.content = content
      return this.content
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