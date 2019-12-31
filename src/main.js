const term = require( 'terminal-kit' ).terminal
const User = require('../session/user')
const conn = require('../session/connection')

const main = async () => {
  term.clear()
  const user = new User(conn.api.getCurrentUserID())
  const _user = await user.getInfo()
  term.white(_user.name, '\n\n')

  conn.api.getThreadList(15, null, ["INBOX"], (err, list) => {
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
    } else if (e.selectedText === 'Chat') {
      chat(list)
    } else if (e.selectedText === 'Settings') {
      settings(list.threadID)
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

const settings = (threadID) => {
  term.clear()
  conn.api.getThreadInfo(threadID, (err, e) => {
    term.bold.white(e.name, '\n\n')

    term.bold.magenta((' '.repeat(10) + 'Group: ').substr(-10)); term.white(e.isGroup.toString(), '\n')
    term.bold.magenta((' '.repeat(10) + 'Mute: ').substr(-10));
    if (e.muteUntil) {
      if (e.muteUntil == -1){
         term.white('permanently\n')
      } else {
        term.white(new Date(e.muteUntil * 1000), '\n')
      }
    } else {
      term.white('false\n')
    }
    term.bold.magenta((' '.repeat(10) + 'Messages: ').substr(-10)); term.white(e.messageCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'), '\n')
    term.bold.magenta((' '.repeat(10) + 'Emoji: ').substr(-10)); term.white(e.emoji.toString(), '\n')
    term.bold.magenta((' '.repeat(10) + 'Color: ').substr(-10)); term.white(e.color.toString()); term.colorRgbHex(`#${e.color}`, ' ██\n')

    term.singleColumnMenu(['Back'], (err, e) => {
      main()
    })
  })
}

const chat = async (list) => {
  let allMess = []
  term.clear()
  let index = 0
  const data = await loadMess(list.threadID, 20)
  allMess.push(data)
  displayChat(list, allMess[0])
  term.on('key', async (key) => {
    if (key === 'UP') {
      index++
      if (allMess.length <= index) {
        const date = allMess[allMess.length - 1][0].timestamp
        const data = await loadMess(list.threadID, 20, (date - 1))
        allMess.push(data)
      }
      displayChat(list, allMess[index])
    } else if (key === 'DOWN') {
      if (index > 0) index--
      const len = allMess.length
      displayChat(list, allMess[index])
    }
  })
}

const displayChat = (list, messages) => {
  term.clear()
  term.magenta('UP - scroll up\nDOWN - scroll down\nBACKSPACE - back to menu\n\n')
  if (!messages) {
    term.grey('Loading...')
  } else {
    for (let mess of messages) {
      const user = list.participants.find(obj => {
        if (obj.userID === mess.senderID) return obj.name
      })
      term.grey((user.name + ': ' + ' '.repeat(20)).substr(0, 20))
      term.white(mess.body, '\n')
    }
  }
}

const loadMess = (id, amount, date) => {
  return new Promise((resolve, reject) => {
    conn.api.getThreadHistory(id, amount, date, (err, e) => {
      resolve(e)
    })
  })
}

module.exports = main