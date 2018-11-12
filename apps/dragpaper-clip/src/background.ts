function savePage(url: string): Promise<number> {
  return fetch('https://engine.fragment0.com/dragpaper/save/webpage?t=' + encodeURIComponent(url), {
    credentials: 'include',
  }).then(res => {
    return res.status === 200 ? 0 : res.status
  })
}

function sendSaved(tid: any, message: number) {
  chrome.tabs.sendMessage(tid, {message: message}, () => {
    //
  })
}

function inject() {
  chrome.tabs.executeScript({
    file: 'dist/content.js',
  })
}

let saving = false
chrome.browserAction.onClicked.addListener((tab: any) => {
  if (!saving) {
    saving = true
    inject()
    
    savePage(tab.url).then((message) => {
      saving = false
      sendSaved(tab.id, message)
    })
  }
})