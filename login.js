const fs = require("fs");
const readline = require("readline");

const clear = require('./clear')
const Table = require('./table')
const tab = new Table(['100%'])

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const log = (err, api) => {
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
  fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()))
  clear()
  const id = api.getCurrentUserID()

  api.getUserInfo(id, (err, data) => {
    console.log('\n\n')
    tab.push(['Logged in!'])
    tab.push([data[id].name])
    tab.center(1, 0)
    tab.draw()
    return
  })
}


module.exports = log