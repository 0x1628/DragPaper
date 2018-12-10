import {JSDOM} from 'jsdom'
import {ReadResult} from '../Clip'

export function read(html: string): ReadResult {
  const {window} = new JSDOM(html)
  const content = window.document.querySelector('.postArticle-content')
  const title = window.document.querySelector('h1')
  if (!title || !content) {
    throw new Error('medium parse error')
  }
  const meta = content.querySelector('.postMetaLockup')
  if (meta) {
    meta.parentNode!.removeChild(meta)
  }
  return {title: title.innerHTML || '', content: content.innerHTML}
}

export function replacer(html: string) {
  html = html.replace(/<figure.*?>.*?<noscript.*?>(.+?)<\/noscript>.*?<\/figure>/g, '<p>$1</p>')
  return html
}