/** Client-side of groupchat. */

const urlParts = document.URL.split("/");
const roomName = urlParts[urlParts.length - 1];
const ws = new WebSocket(`ws://localhost:3000/chat/${roomName}`);


const name = prompt("Username?");

/** called when connection opens, sends join info to server. */

ws.onopen = function(evt) {
  console.log("open", evt);

  let data = {type: "join", name: name};
  ws.send(JSON.stringify(data));
};


/** called when msg received from server; displays it. */

ws.onmessage = async function(evt) {
  console.log("message", evt);

  let msg = JSON.parse(evt.data);
  let item;

  if (msg.type === "note") {
    item = $(`<li><i>${msg.text}</i></li>`);
  }

  // handle if user wants a joke
  else if (msg.type === "chat" && msg.text === '/joke') {
    // if this is the user who wants a joke, give user a joke
    if (msg.name === name) {
      // get a joke
      try {
        const headers = { 'Accept': 'application/json' }
        const response = await
          axios.get("https://icanhazdadjoke.com/", { headers });
        console.log(response);
        item = $(`<li><i>${response.data.joke}<i><li>`);
      }
      catch(err) {
        item = $(`<li><i>Could not get joke<i><li>`);
        console.error(err.message);
      }
    }
    // otherwise, do nothing
  }

  else if (msg.type === "chat") {
    item = $(`<li><b>${msg.name}: </b>${msg.text}</li>`);
  }

  else {
    return console.error(`bad message: ${msg}`);
  }

  $('#messages').append(item);
};


/** called on error; logs it. */

ws.onerror = function (evt) {
  console.error(`err ${evt}`);
};


/** called on connection-closed; logs it. */

ws.onclose = function (evt) {
  console.log("close", evt);
};


/** send message when button pushed. */

$('form').submit(function (evt) {
  evt.preventDefault();

  let data = {type: "chat", text: $("#m").val()};
  ws.send(JSON.stringify(data));

  $('#m').val('');
});

