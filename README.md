# Guess-the-Movie

Having used socket.io in some previous projects (but only to a limited extent), I wanted to play around with the technology some more
and experiment.

# The User Journey

1. User joins a room.
   ![joins](https://raw.githubusercontent.com/ljsikuade/Guess-the-Movie/newfeature/images/join.PNG)

2. Once more than two people have joined. User may select 'ready'.
   ![user ready](https://raw.githubusercontent.com/ljsikuade/Guess-the-Movie/newfeature/images/waiting.PNG)

3. Once four players are ready, the game auto-starts. No more than four players are allowed in a room.
   ![player rejection](https://i.imgur.com/Vt3qtD9.png)

4. Five rounds are played (but this can be any number). Fifteen seconds elapse per round.
   A user cannot enter more than one answer per round.
   ![round view](https://raw.githubusercontent.com/ljsikuade/Guess-the-Movie/newfeature/images/example.PNG)

5. After five rounds, the scores are displayed.
   ![player scores](https://i.imgur.com/EFDkhIW.png)

# Technologies

- React
- Node
- Socket.io

# Set Up

1. Clone this repository.

```
git clone [repository address]
```

2. Install the dependencies.

```
npm install
```

3. Build the project.

```
npm run dev
```

4. Run the server.

```
npm run demon
```

# To Be Added

1. Testing

2. More extensibility and eventually a database

3. Some bugfixes (v. occasional memory leaks that need to be reproduced)
