const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const app = express();
let server = app.listen(8080);
const io = require("socket.io").listen(server);
let movies = {};
let playersIn = 0;
let results = {};
let refinedResults = {};
let roundData = {};
let readyObj = {};

function timer(time, everySecond, whenDone, killCondition) {
  everySecond = everySecond || function() {};
  whenDone = whenDone || function() {};
  let interval = setInterval(() => {
    everySecond(time);
    time-- || clearInterval(interval, whenDone());
  }, 1000);
  killCondition ? clearInterval(interval) : null;
}

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

function movieSelection(movies, room, condition) {
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

    return { plot: editedPlot.join(" "), title: film.title };
  });

  //Not the start of the quiz.
  if (condition) {
    return tenFilmsEdited[roundData[room] + 1];
  }
  //locate which round the room is on. Make that the index.
  return tenFilmsEdited[roundData[room]];
}

// Handle incoming connections from clients.
io.on("connection", socket => {
  getFilm();

  socket.on("disconnect", () => {
    // tbd
  });
  // Once a client has connected, we expect to get a ping from them saying what room they want to join
  socket.on("room", room => {
    socket.join(room);
    let clients = io.sockets.adapter.rooms[room].length;
    if (clients > 4) {
      socket.leave(room);
      let socketId = socket.id;
      //to the client being denied access.
      io.to(`${socketId}`).emit(
        "full",
        `${room} is currently full! (Maximum 4 players.)`
      );
      //to the room as a whole.
    }

    let ultimateClients = io.sockets.adapter.rooms[room].length;
    //Start the room off with empty round data.
    roundData[room] = 0;
    //Send this information to the client to be displayed where relevant.
    io.to(room).emit("round", roundData);
    io.to(room).emit("message", ultimateClients);
  });

  socket.on("ready", room => {
    //A toggleable record of player clicks. ready || not ready
    readyObj = Object.assign({}, readyObj, {
      [socket.id]: readyObj[socket.id] ? 0 : 1
    });
    //Send the number of ready players to the room.
    let readyCount = Object.values(readyObj).reduce((acc, curr) => acc + curr);
    io.to(room).emit("count", readyCount);

    if (readyCount === 4) {
      movies !== {}
        ? io.to(room).emit("players ready", movieSelection(movies, room))
        : io.to(room).emit("loading");
    }
  });
  //player's quiz component mounts
  socket.on("player in", room => {
    playersIn += 1;
    //Start the timer.
    if (playersIn === 4) {
      console.log("players are all in");
      io.to(room).emit("begin round");

      const emitTime = function(timeLeft) {
        io.to(room).emit("time", timeLeft);
      };
      const resetRound = function() {
        if (roundData[room] + 1 > 4) {
          return;
        }
        io.to(room).emit(
          "round over",
          movieSelection(movies, room, "startSecondEntry")
        );
        incrementRound(room);
        const time = new timer(15, emitTime, resetRound);
        return time;
      };

      const stopWatch = new timer(15, emitTime, resetRound);
    }
  });
  //Records client answers.
  socket.on("answer", (correctIncorrect, id, ack) => {
    results = Object.assign(results, {
      [id]: results[id]
        ? results[id].concat({ correctIncorrect })
        : [correctIncorrect]
    });
    ack(results);
  });

  socket.on("round over ack", room => {
    //Find room in round data if it's on round x. End the game.
    let roundCount = Object.keys(roundData).map(roomName =>
      roomName === room ? roundData[roomName] : null
    );
    if (roundCount[0] === 4) {
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
    }
  });
});

//For purposes of primitive extensibility. Each room has a round counter.
//Ideally I would move all room data (results etc.) over to this variable
//in lieu of a database (but obviously a db is preferable)
function incrementRound(room) {
  roundData = Object.assign(roundData, {
    [room]: (roundData[room] += 1)
  });
  console.log(roundData);
}
//Turn refined list into a sorted list.
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

  localResultArray.sort((a, b) => a.value - b.value);
  return localResultArray.reverse();
}
app.use(bodyParser.json());
app.use("/static", express.static("static"));
app.set("view engine", "hbs");

app.get("/", (req, res) => {
  res.render("index");
});
