const term = require( 'terminal-kit' ).terminal
const User = require('../session/user')
const conn = require('../session/connection')

class Threads {
  constructor() {
    this.active = false
    this.allMess = []
  }

  async main() {
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
        this.list = list[e.selectedIndex]
        this.conversation()
      })
    })
  }

  conversation() {
    const list = this.list
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
        this.nicknames()
      } else if (e.selectedText === 'Chat') {
        this.chat()
      } else if (e.selectedText === 'Settings') {
        this.settings()
      } else if (e.selectedText === 'Back') {
        this.main()
      }
    })
  }

  async nicknames () {
    const list = this.list
    term.clear()
    term.magenta('Name' + ' '.repeat(36) + 'Nickname\n')
    for (let {userID, nickname} of list.nicknames) {
      const user = new User(userID)
      conn.api.getUserPhoto(userID, (err, e) => {
        console.log('photo: ', e)
      })
      const text = ((await user.getInfo()).name + ' '.repeat(40)).substr(0, 40)
      term.white(text, nickname, '\n')
    }
    term.singleColumnMenu(['Back'], (err, e) => {
      this.conversation()
    })
  }

  settings() {
    const threadID = this.list.threadID
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
        this.conversation()
      })
    })
  }

  async chat() {
    this.allMess = []
    this.working = true
    this.keyListener()
    term.clear()
    const data = await this.loadMess(10)
    this.allMess.push(data)
    this.displayChat(this.allMess[0])
  }

  keyListener () {
    if (this.active) return
    this.active = true
    let index = 0
    term.on('key', async (key) => {
      if (!this.working) return
      if (key === 'UP') {
        index++
        if (this.allMess.length <= index) {
          const date = this.allMess[this.allMess.length - 1][0].timestamp
          try {
            const data = await this.loadMess(10, (date - 1))
            this.allMess.push(data)
          } catch (err) {
            index--
            return
          }
        }
        this.displayChat(this.allMess[index])
      } else if (key === 'DOWN') {
        if (index > 0) index--
        this.displayChat(this.allMess[index])
      } else if (key === 'r' || key === 'R') {
        this.working = false
        this.reply()
      } else if (key === 'BACKSPACE') {
        this.conversation()
        this.working = false
      }
    })
  }

  displayChat(messages) {
    term.clear()
    term.magenta('UP - scroll up\nDOWN - scroll down\nBACKSPACE - back to menu\nR - reply\n\n')
    if (!messages) {
      term.grey('Loading...')
      return
    }
    for (let mess of messages) {
      const user = this.list.participants.find(obj => {
        if (obj.userID === mess.senderID) return obj.name
      })
      term.grey((user.name + ': ' + ' '.repeat(20)).substr(0, 20))
      term.white(mess.body, '\n')
      if (mess.attachments) {
        if (mess.attachments.length > 0) {
          for (let {url} of mess.attachments) {
            term.green('➣ ', url, '\n')
          }
        }
      }
    }
  }

  loadMess (amount, date) {
    return new Promise((resolve, reject) => {
      conn.api.getThreadHistory(this.list.threadID, amount, date, (err, e) => {
        if (e.length > 0) resolve(e)
        else reject()
      })
    })
  }

  reply () {
    term.magenta('\nREPLY> ')
    term.inputField((err, message) => {
      conn.api.sendMessage(message, this.list.threadID, (err ,e) => {
        if (err) console.error(err)
        term.grey('Sending...')
        this.chat()
      })
    })
  }
}
const threads = new Threads()
module.exports = threads