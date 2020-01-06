const conn = require('./connection')
class User {
  constructor(id) {
    this.id = id
  }

  getInfo() {
    return new Promise((resolve, _reject) => {
      conn.api.getUserInfo(this.id, (err, res) => {
        const keys = Object.keys(res)
        resolve(res[keys[0]])
      })
    })
  }
}

module.exports = User