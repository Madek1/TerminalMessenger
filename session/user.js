const conn = require('./connection')
class User {
  constructor() {
    this.api = conn.api
  }

  get id() {
    return this.api.getCurrentUserID()
  }

  getInfo(id = this.id) {
    return new Promise((resolve, _reject) => {
      this.api.getUserInfo(id, (err, res) => {
        const keys = Object.keys(res)
        resolve(res[keys[0]])
      })
    })
  }
}

const user = new User()

module.exports = user