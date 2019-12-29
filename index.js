const clear = require('./clear')
const Conversations = require('./conversations')
const log = require('./login')
clear()

const fs = require("fs");
const login = require("facebook-chat-api");
const term = require( 'terminal-kit' ).terminal
login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, async (err, api) => {
  try {
    await log(err, api)
  } catch (e) {
    console.log('Nie udało się zalogować!')
  }

  // THREADS LIST
  new Conversations(api)










    // LISTEN
    api.setOptions({
      logLevel: "warn",
      listenEvents: true,
      forceLogin: true
    });
    api.listenMqtt((err, message) => {
      if (message.type === 'message') {
        const _id = message.senderID
        api.getUserInfo(_id, (err, data) => {
          term.grey(data[_id].name, ": ", message.body)
        })
        // api.sendMessage("BOT: " + message.body, message.threadID)
      }
  });
});

