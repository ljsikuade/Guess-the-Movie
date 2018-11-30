import React from "react";
import io from "socket.io-client";
import style from "../styles/style.css";
import Quiz from "./Quiz";
import Lobby from "./Lobby";
import Waiting from "./Waiting";
import Scores from "./Scores";
//c1eda2d27f7a73d8ca633b6936e5b012
//https://api.themoviedb.org/3/discover/movie?api_key=c1eda2d27f7a73d8ca633b6936e5b012&language=en-US&sort_by=popularity.desc&primary_release_year=1980&include_adult=false&include_video=false&page=1
let socket = io();

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      plot: "",
      title: "",
      value: "",
      room: "",
      renderWaiting: false,
      difficult: false,
      lobby: true,
      start: false,
      end: false,
      round: 0,
      message: "",
      gameResults: []
    };
    // this.handleEndOfAnimation = this.handleEndOfAnimation.bind(this);
    this.reloadLobby = this.reloadLobby.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.connectToRoom = this.connectToRoom.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.startQuiz = this.startQuiz.bind(this);
    this.updateQuiz = this.updateQuiz.bind(this);
    this.gameEnd = this.gameEnd.bind(this);
  }

  // handleEndOfAnimation() {
  //   let plotString = this.state.plot.replace(/\s/g, "");
  //   transitionAmount += 1;

  //   //Animation ended START TIMER
  //   transitionAmount === plotString.length ? this.setState({}) : null;
  // }
  reloadLobby(message) {
    this.setState({ message: message, renderWaiting: false, lobby: true });
  }
  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  connectToRoom(value) {
    this.setState({ renderWaiting: true, lobby: false, room: value });
  }

  startQuiz(plot, title) {
    this.setState({
      start: true,
      renderWaiting: false,
      plot: plot,
      title: title
    });
  }

  updateQuiz(plot, title) {
    this.setState({ plot: plot, title: title });
  }

  gameEnd(gameResults) {
    console.log(gameResults);
    this.setState({ start: false, end: true, gameResults: gameResults });
    //{id: [true, false]}
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.state.value === this.state.title) {
      socket.emit("answer", true, socket.id, results => {
        console.log(results);
      });
    } else {
      socket.emit("answer", false, socket.id, results => {
        console.log(results);
      });
    }
  }

  render() {
    return (
      <section>
        {this.state.lobby && (
          <Lobby
            message={this.state.message}
            connectToRoom={this.connectToRoom}
          />
        )}
        {this.state.renderWaiting && (
          <Waiting
            reloadLobby={this.reloadLobby}
            startQuiz={this.startQuiz}
            room={this.state.room}
            socket={socket}
          />
        )}
        {this.state.start && (
          <Quiz
            socket={socket}
            plot={this.state.plot}
            title={this.state.title}
            value={this.state.value}
            handleSubmit={this.handleSubmit}
            handleChange={this.handleChange}
            room={this.state.room}
            gameEnd={this.gameEnd}
            updateQuiz={this.updateQuiz}
          />
        )}
        {this.state.end && (
          <Scores id={socket.id} gameResults={this.state.gameResults} />
        )}
      </section>
    );
  }
}

export default App;
