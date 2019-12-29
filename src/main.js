const term = require( 'terminal-kit' ).terminal

const main = async () => {
  const user = require('../session/user')
  const _user = await user.getInfo()
  term.white(_user.name, '\n\n')

  user.api.getThreadList(10, null, ["INBOX"], (err, list) => {
    const arr = []
    for (let i in list) {
      const id = ~~i + 1
      const {name, unreadCount, messageCount} = list[i]
      arr.push(`${(' ' +id).substr(-2)} ${(name + ' '.repeat(40)).substr(0, 40)}  ${('   ' +unreadCount).substr(-5)}  ${('   ' +messageCount).substr(-6)}`)
    }
    term.singleColumnMenu(arr)

  })
}

module.exports = main