import * as readline from "readline";
import { InputType } from "../util/constants";
import { TransactionService } from "../services/TransactionService";

export class GICApp {
  private rl: readline.Interface;
  private transactionService: TransactionService;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.transactionService = new TransactionService();
  }

  start(): void {
    console.log("Welcome to AwesomeGIC Bank! What would you like to do?");
    this.showMainMenu();
  }

  private async showMainMenu(): Promise<void> {
    console.log("[T] Input transactions");
    console.log("[I] Define interest rules");
    console.log("[P] Print statement");
    console.log("[Q] Quit");

    const answer = this.rl.question(">", (answer) => {
      const option = answer.trim().toLocaleUpperCase();
      switch (option) {
        case InputType.T:
          this.transactionService.handleTransaction();
          break;
        case InputType.Q:
          this.handleQuit();
          break;
        default:
          console.log("Invalid Option, Please select a valid option");
          this.showMainMenu();
          break;
      }
    });
  }

  private handleQuit(): void {
    console.log(
      "Thank you for banking with AwesomeGIC Bank. \n Have a nice day!"
    );
  }
}
