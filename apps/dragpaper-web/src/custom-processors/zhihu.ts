const figureReg = /<figure><noscript>(.+?)<\/noscript>.*?<\/figure>/g // zhihu image lazy load

export function replacer(html: string) {
  html = html.replace(figureReg, '$1')
  return html
}