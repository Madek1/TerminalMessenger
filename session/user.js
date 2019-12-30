const conn = require('./connection')
class User {
  constructor(id) {
    if (!id) {
      id = conn.api.getCurrentUserID()
    }
    this.id = id
    this.api = conn.api
  }

  getInfo() {
    return new Promise((resolve, _reject) => {
      this.api.getUserInfo(this.id, (err, res) => {
        const keys = Object.keys(res)
        resolve(res[keys[0]])
      })
    })
  }
}

module.exports = User