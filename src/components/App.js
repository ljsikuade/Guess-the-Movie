import React from "react";
import io from "socket.io-client";
import style from "../styles/style.scss";
import Quiz from "./Quiz";
import Lobby from "./Lobby";
import Waiting from "./Waiting";
import Scores from "./Scores";

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
      gameResults: [],
      disableAnswerField: false
    };

    this.reloadLobby = this.reloadLobby.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.connectToRoom = this.connectToRoom.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.startQuiz = this.startQuiz.bind(this);
    this.updateQuiz = this.updateQuiz.bind(this);
    this.gameEnd = this.gameEnd.bind(this);
    this.revokeAnswerField = this.revokeAnswerField.bind(this);
  }

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
  //New round (with data) comes in from server.
  updateQuiz(plot, title) {
    this.setState({ plot: plot, title: title });
  }

  gameEnd(gameResults) {
    console.log(gameResults);
    this.setState({ start: false, end: true, gameResults: gameResults });
  }
  // client answers
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
    this.setState({ disableAnswerField: true });
  }
  //re-enable the answer field at the beginning of every round.
  revokeAnswerField() {
    this.setState({ disableAnswerField: false });
  }

  render() {
    return (
      <section className="component-holder">
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
            disableAnswerField={this.state.disableAnswerField}
            revokeAnswerField={this.revokeAnswerField}
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
