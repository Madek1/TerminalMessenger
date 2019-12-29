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
        console.log(message)
        const _id = message.senderID
        api.getUserInfo(_id, (err, data) => {
          if (message['attachments'].length > 0) {
            for (let att of message['attachments']) {
              if (att.hasOwnProperty('url')) {
                message.body += ' \n ' + att.url
              }
            }
          }
          term.grey(data[_id].name, ": ", message.body)
          api.sendMessage(data[_id].name + ": " + message.body, 100005767742338)
        })
      }
  });
});

