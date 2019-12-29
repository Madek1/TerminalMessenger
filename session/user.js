const conn = require('./connection')
class User {
  constructor() {
    this.api = conn.api
  }

  get id() {
    return this.api.getCurrentUserID()
  }
}

const user = new User()

module.exports = user