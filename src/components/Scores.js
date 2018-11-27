import React from "react";

function Scores({ gameResults, id }) {
  return (
    <section>
      <h1>Scores</h1>
      <ul>
        {gameResults.map(result => {
          return (
            <li key={result.key}>
              {result.key} {result.value} {result.key === id ? "<-- you" : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default Scores;
