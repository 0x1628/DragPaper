const urlEls = document.querySelectorAll('.url')

Array.from(urlEls).forEach(el => {
  el.innerHTML = window.saveResult.url
})

document.querySelector(`.result-${window.saveResult.success ? 'success' : 'failure'}`)
  .style.display = 'block'

document.querySelector('.loading').style.display = 'none'