import * as read from 'node-readability'
import http from './http'

class Clip {
  content = ''
  constructor(protected url: string) {}

  async fetchPage(): Promise<string> {
    return http(this.url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.106 Safari/537.36',
      },
    }).then((res): Promise<string> => {
      return new Promise((resolve) => {
        read(res.body, (err: any, article: any, meta: any) => {
          this.content = this.clean(article.title, article.content, this.url)
          resolve(this.content)
        })
      })
    })
  }

  clean(title: string, html: string, url: string): string {
    html = `<h1>${title}</h1>${html}`
    html = html.replace(/(<\w+).*?(\ (src|href)=".+?")?.*?(\/?>)/g, '$1$2$4')

    const cleanerType = url.replace(/https?:\/\/(.+?\.)?(.+?)\.\w+\/?.*/, '$2')
    if (cleanerType) {
      try {
        let cleaner = require(`./cleaners/${cleanerType}`)
        if (cleaner.default) {
          cleaner = cleaner.default
        }
        html = cleaner(html, url)
      } catch(e) {}
    }
    return html
  }

  getContent() {
    return this.content
  }
}

export default Clip