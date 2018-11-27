import React from "react";
//let host = `${window.location.protocol}//${window.location.host}`;
let globalSocket;
class Waiting extends React.Component {
  constructor() {
    super();
    this.state = {
      playerCount: 1,
      players: 0,
      readyCount: 0,
      ready: undefined
    };
    this.readyUp = this.readyUp.bind(this);
  }

  componentDidMount() {
    const { socket } = this.props;
    console.log(socket);
    globalSocket = socket;
    this.connection(globalSocket);
  }

  readyUp() {
    this.setState({ ready: "ready" }, () => this.connection());
  }

  connection(socket) {
    if (this.state.ready) {
      console.log("ready");
      globalSocket.emit("ready", this.props.room);
      globalSocket.on("loading", () => {
        console.log("loading...");
      });
      globalSocket.on("players ready", data => {
        if (data) {
          this.props.startQuiz(data.plot, data.title);
        } else {
          console.log(data);
        }
      });
    }
    if (socket) {
      // set-up a room-based connection between the client and the server
      let room = this.props.room;
      socket.emit("room", room);

      socket.on("message", roomData => {
        this.setState({ players: roomData });
        console.log("You are now in the room", roomData);
      });

      socket.on("count", readyNum => {
        this.setState({ readyCount: readyNum });
      });
    }
  }

  render() {
    return (
      <section>
        <div>
          People in {this.props.room}: {this.state.players}{" "}
        </div>
        <button disabled={this.state.players < 2} onClick={this.readyUp}>
          Ready Up
        </button>
        <div>Players Ready: {this.state.readyCount}</div>
      </section>
    );
  }
}
export default Waiting;
