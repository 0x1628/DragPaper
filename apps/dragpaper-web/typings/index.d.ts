declare module 'https-proxy-agent' {
  import * as https from 'https'

  namespace HttpsProxyAgent {
      interface HttpsProxyAgentOptions {
          host: string
          port: number
          secureProxy?: boolean
          headers?: {
              [key: string]: string
          }
          [key: string]: any
      }
  }
  
  // HttpsProxyAgent doesnt *actually* extend https.Agent, but for my purposes I want it to pretend that it does
  class HttpsProxyAgent extends https.Agent {
      constructor(opts: HttpsProxyAgent.HttpsProxyAgentOptions | string)
  }

  export = HttpsProxyAgent
}

declare module 'node-readability' {
  namespace Read {}
  function Read(url: string, ...rest: any[]): any
  export = Read
}