interface RequestError {
  status: number
}

export class NotFoundError extends Error implements RequestError {
  status = 404

  constructor() {
    super()
    Object.setPrototypeOf(this, NotFoundError.prototype)

    this.name = 'NotFoundError'
    this.message = 'url not found'
  }
}

export class AuthError extends Error implements RequestError {
  status = 403

  constructor() {
    super()
    Object.setPrototypeOf(this, AuthError.prototype)

    this.name = 'AuthError'
    this.message = 'not login or token error'
  }
}