const term = require( 'terminal-kit' ).terminal
const User = require('../session/user')

const main = async () => {
  term.clear()
  const user = new User()
  const _user = await user.getInfo()
  term.white(_user.name, '\n\n')

  user.api.getThreadList(15, null, ["INBOX"], (err, list) => {
    const arr = []
    for (let i in list) {
      const id = ~~i + 1
      const {name, unreadCount, messageCount} = list[i]
      arr.push(`${(' ' +id).substr(-2)} ${(name + ' '.repeat(40)).substr(0, 40)}  ${('     ' +unreadCount).substr(-5)}  ${('      ' +messageCount).substr(-6)}`)
    }
    term.singleColumnMenu(arr, (err, e) => {
      conversation(list[e.selectedIndex])
    })

  })
}

const conversation = (list) => {
  term.clear()
  term.magenta(`Participants (${list.participants.length}): `)
  const participants = list.participants.slice(0,5)
  let text = ''
  for (let member of participants) {
    text += member.name + ', '
  }

  term.grey(text.substring(0, text.length - 2))

  if (list.participants.length > 5) term.grey(', ...')

  term.white('\n\n')

  const options = [
    'Nicknames',
    'Chat',
    'Settings',
    'Back'
  ]

  term.singleColumnMenu(options, (err ,e) => {
    if (e.selectedText === 'Nicknames') {
      nicknames(list)
    } else if (e.selectedText === 'Back') {
      main()
    }
  })
}

const nicknames = async (list) => {
  term.clear()
  term.magenta('Name' + ' '.repeat(36) + 'Nickname\n')
  for (let {userID, nickname} of list.nicknames) {
    const user = new User(userID)
    const text = ((await user.getInfo()).name + ' '.repeat(40)).substr(0, 40)
    term.white(text, nickname, '\n')
  }
  term.singleColumnMenu(['Back'], (err, e) => {
    main()
  })
}

module.exports = main