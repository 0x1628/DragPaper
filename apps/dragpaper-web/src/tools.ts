import * as fs from 'fs'
import * as path from 'path'

const configFile = path.resolve(process.cwd(), 'config.json')

export function readConfigSync() {
  return JSON.parse(fs.readFileSync(configFile).toString())
}

export function readConfig() {
  return new Promise((resolve) => {
    fs.readFile(configFile, (err, data) => {
      resolve(JSON.parse(data.toString()))
    })
  })
}

export function writeConfig(data: any) {
  if (typeof data !== 'string') {
    data = JSON.stringify(data, null, 2)
  }
  return new Promise((resolve) => {
    fs.writeFile(configFile, data, () => {
      resolve()
    })
  })
}