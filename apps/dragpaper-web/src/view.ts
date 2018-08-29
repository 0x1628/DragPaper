import * as fs from 'fs'
import * as path from 'path'

const base = path.resolve(process.cwd(), 'view')

export async function login() {
  return new Promise((resolve) => {
    fs.readFile(path.resolve(base, 'login.html'), (err, data) => {
      resolve(data.toString())
    })
  })
}

export function welcome() {
  return 'welcome'
}