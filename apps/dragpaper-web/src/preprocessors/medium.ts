
export default function(html: string) {
  html = html.replace(/<figure.*?>.*?<noscript.*?>(.+?)<\/noscript>.*?<\/figure>/g, '<p>$1</p>')
  return html
}