const T = require('./table')
const clear = require('./clear')
const term = require( 'terminal-kit' ).terminal

class Conversations {
  constructor (api) {
    this.api = api
    this.draw()
  }

  draw() {
    this.api.getThreadList(10, null, ["INBOX"], (err, list) => {
      clear()
      const t = new T([2, 40, 6, 9])
      t.push(['ID', 'Name', 'Unread', 'Total'])
      t.center(0, 1)
      t.center(0, 3)
      for (let i in list) {
        const id = ~~i + 1
        const {name, unreadCount, messageCount} = list[i]
        t.push([id, name, unreadCount, messageCount])
        t.center(id, 2); t.center(id, 3)
      }
      t.draw()
      term.magenta('Enter conversation id: ')
      term.inputField((error , input) => {
        if (parseInt(input) > 0 && parseInt(input) <= 10) {
          this.selectOption(list[~~input - 1])
          this.list = list[~~input - 1]
        } else exit(0)
      }
      )
    })
  }

  selectOption() {
    clear()
    console.log(`
1) PARTICIPANTS
2) HISTORY
3) PHOTOS
4) MUTE
5) STYLE (emoji, color)
6) BACK`
    )
    term.magenta('Enter option: ')
      term.inputField((error , input) => {
        if (input == 1) this.participants(this.list)
        else if (input == 2) this.history(this.list.threadID)
        else if (input == 4) this.mute(this.list.threadID)
        else if (input == 6) this.draw()
        else exit(0)
    })
  }

  participants(list) {
    const tab = new T([20, 40, 8, 10])
    tab.push(['Name', 'Full name', 'Gender', 'Nickname'])
    for (let i in list.participants) {
      const {shortName, name, gender} = list.participants[i]
      // TODO: NICNAMES
      tab.push([shortName, name, gender, list.nicknames.length > i ? list.nicknames[i].nickname : ''])
    }
    tab.draw()
    console.log(`
1) BACK`
    )
    term.magenta('Enter option: ')
      term.inputField((error , input) => {
        if (input == 1) this.selectOption()
        else exit(0)
    })
  }

  history(id) {
    this.api.getThreadHistory(id, 50, undefined, (err, history) => {
      if(err) return console.error(err)
      const tab = new T([40, 60])
      for (let mess of history) {
        console.log(mess)
        const {body, senderID} = mess
        const obj = this.list.participants.find(e => {
          if (e.userID == senderID) return e.name
        })
        tab.push([obj.name, body])
      }
      tab.draw()
      console.log(`
1) BACK`
      )
      term.magenta('Enter option: ')
        term.inputField((error , input) => {
          if (input == 1) this.selectOption()
          else exit(0)
      })
    })
  }

  mute(id) {
    clear()
    console.log(`
-1 = mute a chat indefinitely
 0  = unmute

    `)
    term.magenta('Time: ')
      term.inputField((error , input) => {
        input = ~~input
        this.api.muteThread(id, input)

        clear()
        if (input !== 0) term.red('Thread has been muted')
        else term.green('Unmuted')
        console.log(`
1) BACK`
        )
        term.magenta('Enter option: ')
          term.inputField((error , input) => {
            if (input == 1) this.selectOption()
            else exit(0)
        })
    })

  }
}

module.exports = Conversations