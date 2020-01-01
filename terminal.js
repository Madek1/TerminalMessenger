const term = require('terminal-kit').terminal
const conn = require('./session/connection')
const threads = require('./src/threads')
term.grabInput()

term.on('key', (key, matches, data) => {
    if (key === 'ESCAPE') loadMenu()
    // Detect CTRL-C and exit 'manually'
    if (key === 'CTRL_C') {
      term.clear()
      process.exit()
    }
})

const loadMenu = () => {
  term.clear()
  term.singleColumnMenu(['LOAD SESSION', 'NEW SESSION', 'LOGOUT'], async (err, e) => {
    if (e.selectedText === 'LOAD SESSION') {
      try {
        await conn.loadSession()
        threads.main()
      } catch (e) {
        console.error(e)
      }
    }
    else if (e.selectedText === 'NEW SESSION') {
      try {
        await conn.newSession()
        main()
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