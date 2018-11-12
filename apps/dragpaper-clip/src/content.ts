(function() {
  const domId = '__dragpaper__'

  const div = document.createElement('div')
  div.id = domId
  div.innerHTML = `
  <style>
  #__dragpaper__ {
    height: 60px;
    line-height: 60px;
    background: #fefefe;
    border-bottom: 1px solid #eee;
    font-size: 18px;
    text-align: center;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999999999;
    width: 100%;
    transition: opacity .3s ease-out;
    opacity: 0;
    font-family: monospace;
  
    box-shadow: 0 2px 8px rgba(0, 0, 0, .1);
  }
  </style>
  <div>&nbsp;&nbsp;&nbsp;Saving...</div>
  `
  
  document.body.appendChild(div)
  requestAnimationFrame(() => {
    div.style.opacity = '1'
  })
})()

chrome.runtime.onMessage.addListener((req: any) => {
  const target = document.getElementById('__dragpaper__')
  if (target) {
    const message = req.message
    if (message === 403) {
      document.body.removeChild(target)
      window.open('https://engine.fragment0.com/dragpaper')
      return
    }
    target.querySelector('div')!.innerText = !message ? 'Saved' : 'Save Error!'
    target.addEventListener('transitionend', () => {
      document.body.removeChild(target)
    })
    setTimeout(() => {
      target.style.opacity = '0'
    }, 600)
  }
})
