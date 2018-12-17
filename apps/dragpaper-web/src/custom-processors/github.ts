import {JSDOM} from 'jsdom'
import {ReadResult, asyncReadability} from '../Clip'
import http from '../http'

const commentRe = /issuecomment-(\d+)$/
export async function read(html: string, url: string): Promise<ReadResult> {
  url = decodeURIComponent(url)
  const u = new URL(url)
  const hash = u.hash.slice(1)
  let commentid
  if (hash.split('&').some(item => {
    const result = item.match(commentRe)
    if (result) {
      commentid = result[1]
      return true
    }
    return false
  })) {
    const {window} = new JSDOM(html)
    const param = window.document.querySelector('#js-timeline-progressive-loader')!.getAttribute('data-timeline-item-src')
    const res = await http(`https://github.com/${param}&anchor=issuecomment-${commentid}`)
    const {window: w2} = new JSDOM(res.body)
    const comment = w2.document.querySelector(`#issuecomment-${commentid} .comment-body`)!
    return {
      title: window.document.title,
      content: comment.innerHTML,
    }
  } else {
    return asyncReadability(html, url)
  }
}