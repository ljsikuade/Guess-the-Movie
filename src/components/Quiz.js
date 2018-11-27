import SplitText from "react-pose-text";
import React from "react";

const charPoses = {
  exit: { opacity: 0, y: 0 },
  enter: {
    opacity: 1,
    y: 0,
    delay: ({ charIndex }) => charIndex * 20
  }
};

class Quiz extends React.Component {
  constructor() {
    super();
    this.state = { time: 15 };
    this.timer = this.timer.bind(this);
  }

  componentDidMount() {
    const { socket } = this.props;
    //emit player in
    socket.emit("player in", this.props.room);
    //listen for round start
    socket.on("begin round", () => this.timer(socket));
    socket.on("round over", movie => {
      this.props.updateQuiz(movie.plot, movie.title);
      socket.emit("round over ack", this.props.room);
    });
    socket.on("game end", data => this.props.gameEnd(data));
  }

  timer(socket) {
    socket.on("time", time => {
      console.log(time);
      if (!Number.isNaN(time)) {
        let rounded = Math.ceil(time / 1000) * 1000;
        let timeInSeconds = rounded / 1000;
        this.setState({ time: timeInSeconds });
      }
    });
  }

  render() {
    console.log(this.props.title);
    return (
      <main className="wrapper">
        <SplitText
          className="animation__text"
          // onPoseComplete={this.handleEndOfAnimation}
          initialPose="exit"
          pose="enter"
          charPoses={charPoses}
        >
          {this.props.plot}
        </SplitText>
        <h1 className="timer">{this.state.time}</h1>
        <form onSubmit={this.props.handleSubmit} className="guess">
          <input
            value={this.props.value}
            className="guess__field"
            onChange={this.props.handleChange}
          />
        </form>
      </main>
    );
  }
}

export default Quiz;
