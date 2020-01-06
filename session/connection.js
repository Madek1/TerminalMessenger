const fs = require("fs")
const login = require("facebook-chat-api")
const term = require('terminal-kit').terminal

class Connection {
  newSession() {
    return new Promise((resolve, reject) => {
      term.clear()
      term('Please enter your email: ')
      term.inputField((err, email) => {
        term('\nPlease enter your password: ')
        term.inputField({echoChar: true}, async (err, pass) => {
          try {
            await this.new(email, pass)
            resolve()
          } catch(e) {
            reject()
          }
        })
      })
    })
  }

  new(email, pass) {
    return new Promise((resolve, reject) => {
      const readline = require("readline")
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })
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
        fs.writeFileSync(process.env.SESSION_LOCATION, JSON.stringify(api.getAppState()))
        term.clear()
        resolve()
      })
    })
  }

  loadSession() {
    return new Promise((resolve, reject) => {
      term.clear()
      login({appState: JSON.parse(fs.readFileSync(process.env.SESSION_LOCATION , 'utf8'))}, (err, api) => {
        if(err) {
          console.error(err)
          reject('Connection error')
        }
        api.setOptions({
          logLevel: "silent",
          listenEvents: true,
          forceLogin: true,
          autoMarkDelivery: 'false'
        });

        api.listen((err, e) => {
          console.log(e.body)
        })

        this.api = api
        fs.writeFileSync(process.env.SESSION_LOCATION, JSON.stringify(api.getAppState()))
        term.clear()

        resolve()
      })
    })
  }

  logout() {
    this.api.logout()
  }
}

const connection = new Connection()
module.exports = connection