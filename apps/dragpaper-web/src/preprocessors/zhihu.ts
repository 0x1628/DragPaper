const figureReg = /<figure><noscript>(.+?)<\/noscript>.*?<\/figure>/g // zhihu image lazy load

export default function(html: string) {
  html = html.replace(figureReg, '$1')
  return html
}