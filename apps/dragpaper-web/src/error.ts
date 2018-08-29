interface RequestError {
  status: number
}

export class NotFoundError extends Error implements RequestError {
  status = 404

  constructor() {
    super()
    this.name = 'NotFoundError'
    this.message = 'url not found'
  }
}

export class AuthError extends Error implements RequestError {
  status = 403

  constructor() {
    super()

    this.name = 'AuthError'
    this.message = 'nor login or token error'
  }
}