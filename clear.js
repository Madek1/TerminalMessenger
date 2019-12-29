const c = require('clear')
const T = require('./table')

const t = new T([60])
t.push(['SILENT MESSENGER'])
const clear = () => {
  c()
  t.center(0, 0)
  t.draw()
}

module.exports = clear