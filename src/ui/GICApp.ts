import * as readline from "readline";
import {
  amountValidation,
  dateValidation,
  ERROR_CODES,
  InputType,
  TransactionType,
} from "../util/constants";
import { TransactionService } from "../services/TransactionService";
import { parseDate } from "../util/TransactionServiceHelper";
import { InterestService } from "../services/InterestService";

export class GICApp {
  private rl: readline.Interface;
  private transactionService: TransactionService;
  private interestService: InterestService;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.transactionService = new TransactionService();
    this.interestService = new InterestService();
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
        case InputType.INTEREST_RULES:
          this.handleInterestRules();
          break;
        case InputType.PRINT_STATEMENT:
          this.handlePrintStatement();
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
        // if (transactionDetails.length !== 4) {
        //   console.log(ERROR_CODES.INSUFFICIENT_DETAILS_ERROR);
        //   this.handleInputTransaction();
        //   return;
        // }
        this.validateDetails(transactionDetails, 4);
        const [date, accountId, type, amount] = transactionDetails;
        const parsedType = type.trim().toUpperCase() as TransactionType;

        this.validateDate(date);

        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          console.log(ERROR_CODES.INVALID_AMOUNT);
          this.handleInputTransaction();
          return;
        }
        if (!amountValidation.test(amount)) {
          console.log(ERROR_CODES.AMOUNT_FORMAT_ERROR);
          this.handleInputTransaction();
          return;
        }

        if (!Object.values(TransactionType).includes(parsedType)) {
          console.log(ERROR_CODES.INVALID_TXN_TYPE_ERROR);
          this.handleInputTransaction();
          return;
        }

        this.transactionService.processTransaction(
          parseDate(date),
          accountId,
          parsedType,
          parseFloat(amount)
        );
        this.displayTransactions(accountId);
        console.log("Is there anything else you'd like to do?");
        this.showMainMenu();
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          this.handleInputTransaction();
        } else {
          console.log(ERROR_CODES.ERROR);
          this.showMainMenu();
        }
      }
      return;
    });
  }

  private handleInterestRules(): void {
    console.log(
      "Please enter interest rules details in <Date> <RuleId> <Rate in %> format (or enter blank to go back to main menu):"
    );
    this.rl.question(">", (answer) => {
      if (!answer.trim()) {
        this.showMainMenu();
        return;
      }

      try {
        const interestDetails = answer.split(" ");
        // if (transactionDetails.length !== 3) {
        //   console.log(ERROR_CODES.INSUFFICIENT_DETAILS_ERROR);
        //   this.handleInputTransaction();
        //   return;
        // }
        this.validateDetails(interestDetails, 3);
        const [date, ruleId, rate] = interestDetails;

        this.validateDate(date);

        if (parseFloat(rate) <= 0 || parseFloat(rate) > 100) {
          console.log(ERROR_CODES.INVALID_INTEREST_AMOUNT);
          this.handleInterestRules();
          return;
        }

        this.interestService.processInterestRule(
          parseDate(date),
          ruleId,
          parseFloat(rate)
        );

        this.displayInterestRules();
        console.log("Is there anything else you'd like to do?");
        this.showMainMenu();
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          this.handleInterestRules();
        } else {
          console.log(ERROR_CODES.ERROR);
          this.showMainMenu();
        }
      }
    });
  }

  private handlePrintStatement(): void {
    console.log(
      "Please enter account and month to generate the statement <Account> <Year><Month> (or enter blank to go back to main menu):"
    );
    this.rl.question(">", (answer) => {
      if (!answer.trim()) {
        this.showMainMenu();
        return;
      }

      try {
        const printStatementDetails = answer.trim().split(" ");
        this.validateDetails(printStatementDetails, 2);

        // const account = this.transactionService.getAccount(accountId);
        // if (!account) {
        //   throw new Error(`Account ${accountId} not found`);
        // }
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
          this.handlePrintStatement();
        } else {
          console.log(ERROR_CODES.ERROR);
          this.showMainMenu();
        }
      }
    });
  }

  private displayTransactions(accountId: string): void {
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
    console.log("\n");
  }

  private displayInterestRules(): void {
    console.log("Interest rules:");
    console.log("| Date     | RuleId | Rate (%) |");

    this.interestService.getInterestRules().forEach((rule) => {
      const ruleDate = rule.date;
      const dateFormatted = `${ruleDate.getFullYear()}${(
        ruleDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}${ruleDate.getDate().toString().padStart(2, "0")}`;
      const rateFormatted = rule.rate.toFixed(2);

      console.log(
        `| ${dateFormatted} | ${rule.ruleId} | ${rateFormatted.padStart(8)} |`
      );
    });
    console.log("\n");
  }

  private validateDetails(details: string[], numberOfDetails: number): void {
    if (details.length !== numberOfDetails) {
      throw new Error(ERROR_CODES.INSUFFICIENT_DETAILS_ERROR);
    }
  }

  private validateDate(date: string): void {
    if (!dateValidation.test(date)) {
      throw new Error(ERROR_CODES.INVALID_DATE_FORMAT_ERROR);
    }

    if (parseDate(date) > new Date()) {
      throw new Error(ERROR_CODES.INVALID_DATE_ERROR);
    }
    return;
  }
}
