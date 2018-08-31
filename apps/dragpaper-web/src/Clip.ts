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
          this.content = article.content
          resolve(this.content)
        })
      })
    })
  }

  getContent() {
    return this.content
  }
}

export default Clip