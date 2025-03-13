import * as readline from "readline";
import {
  amountValidation,
  dateValidation,
  InputType,
  TransactionType,
} from "../util/constants";
import { TransactionService } from "../services/TransactionService";
import { Transaction } from "../models/Transaction";
import { parseDate } from "../util/TransactionServiceHelper";

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

  private showMainMenu(): void {
    console.log("[T] Input transactions");
    console.log("[I] Define interest rules");
    console.log("[P] Print statement");
    console.log("[Q] Quit");

    this.rl.question(">", (answer) => {
      const option = answer.trim().toLocaleUpperCase();
      switch (option) {
        case InputType.INPUT_TRANSACTION:
          this.handleInputTransaction();
          break;
        case InputType.QUIT:
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
    this.rl.close();
  }

  private handleInputTransaction(): void {
    console.log(
      "Please enter transaction details in <Date> <Account> <Type> <Amount> format \n(or enter blank to go back to main menu):"
    );
    this.rl.question(">", (answer) => {
      if (!answer.trim()) {
        this.showMainMenu();
        return;
      }
      try {
        const transactionDetails = answer.split(" ");
        if (transactionDetails.length !== 4) {
          console.log("Insufficient details");
        }
        const [date, accountId, type, amount] = transactionDetails;
        const parsedType = type.trim().toUpperCase() as TransactionType;

        if (!dateValidation.test(date)) {
          console.log(
            "Invalid date format. The date should be in YYYYMMdd format"
          );
          this.handleInputTransaction();
          return;
        }
        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          console.log("The amount has to be greater than 0");
        }
        if (!amountValidation.test(amount)) {
          console.log(
            "Invalid format. The amount can not be more than 2 decimals"
          );
          this.handleInputTransaction();
          return;
        }

        if (!Object.values(TransactionType).includes(parsedType)) {
          console.log("Invalid transaction type");
          this.handleInputTransaction();
          return;
        }

        const transaction = this.transactionService.processTransaction(
          parseDate(date),
          accountId,
          parsedType,
          parseFloat(amount)
        );
        this.displayTransactions(accountId);
        console.log("Is there anything else you'd like to do?");
        this.showMainMenu();
      } catch (error) {
        console.log(error);
        this.showMainMenu();
      }
      return;
    });
  }

  displayTransactions(accountId: string): void {
    console.log(`Account: ${accountId}`);
    console.log("| Date     | Txn Id      | Type | Amount |");

    this.transactionService.getTransactions().forEach((txn) => {
      const txnDate = txn.date;
      const dateFormatted = `${txnDate.getFullYear()}${(txnDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${txnDate.getDate().toString().padStart(2, "0")}`;
      const typeFormatted = txn.type;
      const amountFormatted = txn.amount.toFixed(2);

      console.log(
        `| ${dateFormatted} | ${txn.id} | ${typeFormatted}    | ${amountFormatted} |`
      );
    });
    console.log("");
  }
}
