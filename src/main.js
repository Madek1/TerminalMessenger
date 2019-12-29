const term = require( 'terminal-kit' ).terminal


const main = () => {
  const user = require('../session/user')
  console.log('info ', user.getInfo)
}

module.exports = main