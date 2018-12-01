import React from "react";

function Scores({ gameResults, id }) {
  return (
    //Scores come in as [user] : score.
    <section className="scores">
      <h1 className="scores-title">Scores</h1>
      <ul className="scores-list">
        {gameResults.map(result => {
          return (
            <li className="scores-list-item" key={result.key}>
              {result.key} &nbsp; {result.value}{" "}
              {result.key === id ? "<-- you" : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default Scores;
