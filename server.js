const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const app = express();
let server = app.listen(8080);
const io = require("socket.io").listen(server);
let Stopwatch = require("tm-timer");
let readyCount = 0;
let movies = {};
const options = { refreshRateMS: 1000, almostDoneMS: 1000 };
let playersIn = 0;
let results = {};
let refinedResults = {};
let roundData = {};
let gameOver = false;
let timer = new Stopwatch(15000);
// attach Socket.io to our HTTP server
function getFilm() {
  let randomYear = generateRandomYear(1960, 2018);
  fetch(
    `https://api.themoviedb.org/3/discover/movie?api_key=c1eda2d27f7a73d8ca633b6936e5b012&language=en-US&sort_by=popularity.desc&primary_release_year=${randomYear}&include_adult=false&include_video=false&page=1`
  )
    .then(response => response.json())
    .then(body => (movies = body));
}

function generateRandomYear(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function movieSelection(movies, room) {
  let tenFilms = [];
  //Pick film lineup for room.
  for (let i = 0; i < 10; i++) {
    tenFilms.push(movies.results[i]);
  }
  let tenFilmsEdited = tenFilms.map(film => {
    let words = film.overview.split(" ");
    let titleDisected = film.title.split(" ");
    const exclude = ["the", "as", "and", "is", "for", "in", "of"];
    let editedPlot = words.map(word =>
      titleDisected.includes(word) && !exclude.includes(word)
        ? new Array(word.length + 1).join(" ")
        : word
    );
    //console.log("edited plot:", editedPlot.join(" "), "film title", film.title);
    return { plot: editedPlot.join(" "), title: film.title };
  });
  //locate which round the room is on. Make that the index.
  console.log(tenFilmsEdited);
  return tenFilmsEdited[roundData[room]];
}

// handle incoming connections from clients
io.on("connection", socket => {
  getFilm();
  // once a client has connected, we expect to get a ping from them saying what room they want to join
  socket.on("disconnect", () => {
    timer.destroy();
    // io.to(room).emit("A user disconnected!");
  });

  socket.on("room", room => {
    socket.join(room);
    roundData[room] = 0;
    console.log(roundData);
    let clients = io.sockets.adapter.rooms[room].length;
    io.to(room).emit("message", clients);
    socket.on("answer correct", socket => {});
    socket.on("answer wrong", socket => {});
  });

  socket.on("ready", room => {
    //persisting ready state.
    readyCount++;
    console.log("ready count:", readyCount);
    io.to(room).emit("count", readyCount);
    if (readyCount === 4) {
      movies !== {}
        ? io.to(room).emit("players ready", movieSelection(movies, room))
        : io.to(room).emit("loading");
    }
  });
  //player's quiz component mounts
  socket.on("player in", room => {
    //console.log(movieSelection(movies, room));
    playersIn += 1;
    if (playersIn === 4) {
      console.log("players are all in");
      io.to(room).emit("begin round");
      timer.start();
      timer.onTick((isBigTick, timeLeft) => {
        if (isBigTick && !gameOver) {
          io.to(room).emit("time", timeLeft);
          console.log(timeLeft);
        }
      });
      timer.whenDone(() => {
        io.to(room).emit("round over", movieSelection(movies, room));
        timer.reset();
        timer.start();
        incrementRound(room);
      });
    }
  });

  socket.on("answer", (correctIncorrect, id, ack) => {
    results = Object.assign(results, {
      [id]: results[id]
        ? results[id].concat(correctIncorrect)
        : [correctIncorrect]
    });
    //console.log(results);
    ack(results);
  });

  socket.on("round over ack", room => {
    //find room in round data if it's on round 10. End the game.
    let roundCount = Object.keys(roundData).map(roomName =>
      roomName === room ? roundData[roomName] : null
    );
    if (roundCount[0] === 8) {
      timer.destroy();
      console.log("yoyo");
      //turn {id: [true, false, true]} into {id: 2}
      Object.keys(results).forEach(key => {
        refinedResults = Object.assign({}, refinedResults, {
          [key]: results[key]
            ? results[key].reduce((acc, curr) => {
                if (curr === true) {
                  acc += 1;
                }
                return acc;
              }, 0)
            : 0
        });
      });
      //Send the final sorted results over.
      io.to(room).emit("game end", sorted(refinedResults));
      gameOver = true;
    }
  });
});

//For purposes of primitive extensibility. Each room has a round counter.
function incrementRound(room) {
  roundData = Object.assign(roundData, {
    [room]: (roundData[room] += 1)
  });
  console.log(roundData);
}
////Turn refined list into a sorted list.
function sorted(refinedResults) {
  let localResultArray = [];
  for (let prop in refinedResults) {
    if (refinedResults.hasOwnProperty(prop)) {
      localResultArray.push({
        key: prop,
        value: refinedResults[prop]
      });
    }
  }
  console.log(localResultArray);
  localResultArray.sort((a, b) => a.value - b.value);
  return localResultArray.reverse();
}
app.use(bodyParser.json());
app.use("/static", express.static("static"));
app.set("view engine", "hbs");

app.get("/", (req, res) => {
  res.render("index");
});
