import React from "react";

class Lobby extends React.Component {
  constructor() {
    super();
    this.state = { value: "" };
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

  componentDidMount() {}

  render() {
    return (
      <section>
        <form onSubmit={this.handleSubmit}>
          <input value={this.state.value} onChange={this.handleChange} />
        </form>
      </section>
    );
  }
}
export default Lobby;
