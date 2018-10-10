export function addLineForBlock(html: string) {
  const lineEndRe = /(<\/(p|div|blockquote|ul|pre)>)/g
  return html.replace(lineEndRe, '$1<p>&nbsp;</p>')
}