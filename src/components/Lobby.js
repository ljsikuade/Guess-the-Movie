import React from "react";
import SplitText from "react-pose-text";

const charPoses = {
  exit: { opacity: 0, y: 0 },
  enter: {
    opacity: 1,
    y: 0
  }
};

class Lobby extends React.Component {
  constructor() {
    super();
    this.state = { value: "", showFullMessage: true };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.props.connectToRoom(this.state.value);
  }
  //Only when the component gets remounted.
  componentDidMount() {
    if (this.props.message) {
      setTimeout(() => this.setState({ showFullMessage: false }), 3000);
    }
  }

  render() {
    return (
      <section className="lobby">
        <h1 className="title">Create a room</h1>
        <form className="room-selector" onSubmit={this.handleSubmit}>
          <input
            className="room-input"
            value={this.state.value}
            onChange={this.handleChange}
          />
        </form>

        {this.state.showFullMessage && (
          <SplitText
            className="warning-text"
            initialPose="exit"
            pose="enter"
            charPoses={charPoses}
          >
            {this.props.message}
          </SplitText>
        )}
      </section>
    );
  }
}
export default Lobby;
