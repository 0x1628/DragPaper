import * as fs from 'fs'
import * as path from 'path'

class TempFile {
  static base = path.resolve(process.cwd())

  fileName = ''
  constructor(protected str: string) {
    this.fileName = `.${Date.now()}_${Math.floor(Math.random() * 1000)}`
  }
  async save(): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.getFilePath(), this.str, (err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }
  async destroy(): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.unlink(this.getFilePath(), (err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }
  getFilePath() {
    return path.resolve(TempFile.base, this.fileName)
  }
}

export default TempFile