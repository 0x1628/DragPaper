/// <css-inject path="./options.css" />

const defaultConfig = {
  restyle: true,
}

let config: any = null

const save = (name: string, value: any) => {
  if (typeof value === 'object') {
    value = JSON.stringify(value)
  }
  config[name] = value
  chrome.storage.sync.set({config}, () => {
  })
}

const update = () => {
  const inputs = document.querySelectorAll('#form input')
  console.log(config, inputs)
  Array.from(inputs).forEach(item => {
    const input = item as HTMLInputElement
    if (typeof config[input.name] !== 'undefined') {
      if (['checkbox'].includes(input.type)) {
        input.checked = config[input.name]
      } else {
        input.value = config.value
      }
    }
  })
}

const init = () => {
  chrome.storage.sync.get(['config'], (result: any) => {
    config = {
      ...defaultConfig,
      ...result.config,
    }
    
    document.getElementById('form')!.addEventListener('change', (e) => {
      const input = (<HTMLInputElement>e.target)
      let value
      if (['checkbox'].includes(input.type)) {
        value = input.checked
      } else {
        value = input.value
      }
      save(input.name, value)
    })

    update()
  })
}

document.addEventListener('DOMContentLoaded', () => {
  init()
})