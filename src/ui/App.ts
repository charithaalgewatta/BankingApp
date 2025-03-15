import * as readline from "readline";
import {
  amountValidation,
  dateValidation,
  ERROR_CODES,
  InputType,
  TransactionType,
  yearMonthValidation,
} from "../util/constants";
import { TransactionService } from "../services/TransactionService";
import { parseDate, parseDateForInterest } from "../util/ServiceHelper";
import { InterestService } from "../services/InterestService";
import { AccountService } from "../services/AccountService";

export class App {
  private rl: readline.Interface;
  private transactionService: TransactionService;
  private accountService: AccountService;
  private interestService: InterestService;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.transactionService = new TransactionService();
    this.interestService = new InterestService();
    this.accountService = AccountService.getInstance();
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
    this.rl.question(">", (input) => {
      const answer = input.trim();
      if (!answer) {
        this.showMainMenu();
        return;
      }
      try {
        const transactionDetails = answer.split(" ");

        this.validateDetails(transactionDetails, 4);
        const [date, accountId, type, amount] = transactionDetails;
        const parsedType = type.trim().toUpperCase() as TransactionType;

        this.validateDate(date);

        if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          throw new Error(ERROR_CODES.INVALID_AMOUNT);
        }
        if (!amountValidation.test(amount)) {
          throw new Error(ERROR_CODES.AMOUNT_FORMAT_ERROR);
        }

        if (!Object.values(TransactionType).includes(parsedType)) {
          throw new Error(ERROR_CODES.INVALID_TXN_TYPE_ERROR);
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
    this.rl.question(">", (input) => {
      const answer = input.trim();
      if (!answer) {
        this.showMainMenu();
        return;
      }

      try {
        const interestDetails = answer.split(" ");
        this.validateDetails(interestDetails, 3);
        const [date, ruleId, rate] = interestDetails;

        this.validateDate(date);

        if (parseFloat(rate) <= 0 || parseFloat(rate) > 100) {
          throw new Error(ERROR_CODES.INVALID_INTEREST_AMOUNT);
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
    this.rl.question(">", (input) => {
      const answer = input.trim();
      if (!answer) {
        this.showMainMenu();
        return;
      }

      try {
        const printStatementDetails = answer.trim().split(" ");
        this.validateDetails(printStatementDetails, 2);

        const [accountId, yearMonth] = printStatementDetails;

        this.validateYearMonth(yearMonth);

        // const account = this.accountService.getAccount(accountId);
        const { year, month } = parseDateForInterest(yearMonth);

        const interest = this.interestService.calculateInterest(
          year,
          month,
          this.transactionService
        );

        const lastDay = new Date(year, month, 0).getDate();

        console.log("interest", interest);
        if (interest > 0) {
          console.log("Interest calculated for the month");
          const interestDate = new Date(year, month - 1, lastDay);
          this.transactionService.createTransaction({
            date: interestDate,
            accountId,
            type: TransactionType.INTEREST,
            amount: interest,
            id: "",
          });
        }

        // const transactions = this.transactionService.getTransactions(
        //   parseDateForInterest(yearMonth)
        // );

        this.displayMonthlyStatement(accountId, year, month);
        console.log("Is there anything else you'd like to do?");
        this.showMainMenu();
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

  private displayMonthlyStatement(
    accountId: string,
    year: number,
    month: number
  ): void {
    console.log(`Account: ${accountId}`);
    console.log("| Date     | Txn Id      | Type | Amount | Balance |");

    let runningBalance = 0;
    const allTransactions = this.transactionService
      .getTransactions({ year, month })
      .sort(
        (a, b) =>
          a.date.getTime() - b.date.getTime() ||
          (a.type === TransactionType.INTEREST ? 1 : 0) -
            (b.type === TransactionType.INTEREST ? 1 : 0)
      );

    const startOfMonth = new Date(year, month - 1, 1);
    runningBalance = this.transactionService.getBalanceByDate(
      new Date(startOfMonth.getTime() - 1)
    );

    for (const txn of allTransactions) {
      if (
        txn.type === TransactionType.DEPOSIT ||
        txn.type === TransactionType.INTEREST
      ) {
        runningBalance += txn.amount;
      } else if (txn.type === TransactionType.WITHDRAWAL) {
        runningBalance -= txn.amount;
      }

      const txnDate = txn.date;
      const dateFormatted = `${txnDate.getFullYear()}${(txnDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${txnDate.getDate().toString().padStart(2, "0")}`;
      const txnIdFormatted =
        txn.type === TransactionType.INTEREST ? "" : txn.id;
      const typeFormatted = txn.type;
      const amountFormatted = txn.amount.toFixed(2);
      const balanceFormatted = runningBalance.toFixed(2);

      console.log(
        `| ${dateFormatted} | ${txnIdFormatted.padEnd(
          11
        )} | ${typeFormatted}    | ${amountFormatted.padStart(
          6
        )} | ${balanceFormatted.padStart(7)} |`
      );
    }
  }

  private validateDetails(details: string[], numberOfDetails: number): void {
    if (details.length !== numberOfDetails) {
      throw new Error(ERROR_CODES.INSUFFICIENT_DETAILS_ERROR);
    }
  }
  private validateYearMonth(yearMonthStr: string): void {
    if (!yearMonthValidation.test(yearMonthStr)) {
      throw new Error(ERROR_CODES.INVALID_YEAR_MONTH_FORMAT_ERROR);
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
