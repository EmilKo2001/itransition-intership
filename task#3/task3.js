import { randomBytes, createHmac } from "crypto";
import { question } from "readline-sync";

class Game {
  constructor(moves) {
    this.moves = moves;
    this.key = randomBytes(32).toString("hex");
    this.computerMove = this.getRandomMove();
  }

  getRandomMove() {
    const randomIndex = Math.floor(Math.random() * this.moves.length);
    return this.moves[randomIndex];
  }

  calculateHMAC(move) {
    const hmac = createHmac("sha256", this.key);
    hmac.update(move);
    return hmac.digest("hex");
  }

  playGame() {
    const hmac = this.calculateHMAC(this.computerMove);
    console.log(`HMAC: ${hmac}`);

    console.log("Available moves:");
    this.moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
    console.log("0 - exit");
    console.log("? - help");

    const userChoice = question("Enter your move: ");

    if (userChoice === "0") {
      process.exit();
    } else if (userChoice === "?") {
      this.displayHelpTable();
      return;
    }

    const userIndex = parseInt(userChoice, 10) - 1;
    const userMove = this.moves[userIndex];

    console.log(`Your move: ${userMove}`);
    console.log(`Computer's move: ${this.computerMove}`);

    if (userMove === this.computerMove) {
      console.log("It's a draw!");
    } else {
      console.log("You win!");
    }

    console.log(`HMAC key: ${this.key}`);
  }

  displayHelpTable() {
    console.log("Help Table:");
    const table = [["Moves", ...this.moves]];

    for (let i = 0; i < this.moves.length; i++) {
      const row = [this.moves[i]];
      for (let j = 0; j < this.moves.length; j++) {
        if (i === j) {
          row.push("Draw");
        } else if (this.isWinningMove(this.moves[i], this.moves[j])) {
          row.push("Win");
        } else {
          row.push("Lose");
        }
      }
      table.push(row);
    }

    console.table(table);
  }

  isWinningMove(move1, move2) {
    const index = this.moves.indexOf(move1);
    const halfLength = Math.floor(this.moves.length / 2);

    const winningMoves = this.moves.slice(index + 1, index + 1 + halfLength);
    const losingMoves = this.moves.slice(index - halfLength, index);

    return winningMoves.includes(move2);
  }
}

const args = process.argv.slice(2);

if (args.length % 2 === 0 || args.length < 3) {
  console.error(
    "Error: Please provide an odd number >= 3 of non-repeating strings as command line arguments."
  );
  console.error("Example: node script.js rock paper scissors");
  process.exit(1);
}

const game = new Game(args);
game.playGame();
