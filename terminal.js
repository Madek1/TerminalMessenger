const term = require( 'terminal-kit' ).terminal
const conn = require('./session/connection')

term.grabInput()

term.on('key', function(key, matches, data) {
    if (key === 'ESCAPE') loadMenu()
    // Detect CTRL-C and exit 'manually'
    if (key === 'CTRL_C') process.exit()
})

const loadMenu = () => {
  term.clear()
  term.singleColumnMenu(['LOAD SESSION', 'NEW SESSION', 'LOGOUT'], (err, e) => {
    if (e.selectedText === 'LOAD SESSION') {
      try {
        conn.loadSession()
      } catch (e) {
        console.error(e)
      }
    }
    else if (e.selectedText === 'NEW SESSION') {
      try {
        conn.newSession()
      } catch (e) {
        console.error(e)
      }
    }
    else if (e.selectedText === 'LOGOUT') {
      try {
        conn.logout()
      } catch (e) {
        console.error(e)
      }
    }
  })
}

loadMenu()