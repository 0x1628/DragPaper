const ts = require('typescript')
const readline = require('readline')
const fs = require('fs')

const configPath = ts.findConfigFile(
  process.cwd(),
  ts.sys.fileExists,
  'tsconfig.json'
)

const createProgram = ts.createSemanticDiagnosticsBuilderProgram

const host = ts.createWatchCompilerHost(
  configPath,
  {},
  ts.sys,
  createProgram
)

class CSSInject {

  constructor(path) {
    this.path = path
    this.parse()
  }

  parse() {
    const inputStream = fs.createReadStream(this.path)
    const rl = readline.createInterface({
      input: inputStream,
      crlfDelay: Infinity
    })

    rl.on('line', (line) => {
      if (!line.startsWith('///')) {
        inputStream.close()
        rl.close()
      }
      const result = CSSInject.re.exec(line)
      console.log(233, line, result)
    })
  }

  cancel() {

  }
}
CSSInject.re = /\<css path="(.+?)"/
CSSInject.queue = []
CSSInject.clean = () => {
  if (CSSInject.queue.length) {
    CSSInject.queue.forEach(i => i.cancel())
    CSSInject.queue.length = 0
  }
}
CSSInject.init = (items) => {
  CSSInject.clean()
  CSSInject.queue = items.map(filePath => new CSSInject(filePath))
}

const originCreateProgram = host.createProgram
host.createProgram = (
  rootNames,
  options,
  host, oldProgram,
) => {
  CSSInject.init(rootNames)
  return originCreateProgram(rootNames, options, host, oldProgram)
}

const originAfterCreateProgram = host.afterProgramCreate
host.afterProgramCreate = program => {
  console.log(program.getCompilerOptions())
  originAfterCreateProgram(program)
}

ts.createWatchProgram(host)
