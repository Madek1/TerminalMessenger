const fs = require("fs")
const login = require("facebook-chat-api")
const term = require('terminal-kit').terminal

class Connection {
  newSession() {
    term.clear()
    term('Please enter your email: ')
    term.inputField((err, email) => {
      term('\nPlease enter your password: ')
      term.inputField({echoChar: true}, (err, pass) => {
        this.new(email, pass)
      })
    })
  }

  new(email, pass) {
    term.clear()
    login({email, password: pass}, (err, api) => {
      if(err) {
        switch (err.error) {
            case 'login-approval':
                console.log('Enter code > ');
                rl.on('line', (line) => {
                    err.continue(line);
                    rl.close();
                });
                break;
            default:
                console.error(err);
        }
        return
      }
      this.api = api
      fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()))
      term.clear()
    })

  }

  loadSession() {
    term.clear()
    login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
      if(err) {
        console.error(err)
        throw new Error('Login failed')
      }
      this.api = api
      fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()))
      term.clear()
    })
  }

  logout() {
    this.api.logout(err => {
      if (err) {
        throw new Error(err)
      }
    })
  }
}

const connection = new Connection()
module.exports = connection