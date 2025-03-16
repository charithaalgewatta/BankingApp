import { Account } from "../models/Account";
import { Transaction } from "../models/Transaction";
import {
  ERROR_CODES,
  PrintStatementDateProps,
  TransactionType,
} from "../util/constants";
import { generateTransactionID } from "../util/ServiceHelper";
import { AccountService } from "./AccountService";

export class TransactionService {
  private transactions: Transaction[] = [];

  processTransaction(
    date: Date,
    accountId: string,
    type: TransactionType,
    amount: number
  ): Transaction {
    const accountService = AccountService.getInstance();
    accountService.addAccount(accountId);

    if (type === TransactionType.WITHDRAWAL) {
      const balance = this.getBalanceByDate(date);
      if (balance < amount) {
        throw new Error(ERROR_CODES.INSUFFICIENT_FUNDS_ERROR);
      }
    }

    const transactionId = generateTransactionID(this.transactions, date);
    const transaction = new Transaction(
      transactionId,
      date,
      accountId,
      type,
      amount
    );

    this.createTransaction(transaction);

    return transaction;
  }

  public createTransaction(transaction: Transaction): void {
    if (
      transaction.accountId !==
      AccountService.getInstance()
        .getAccount(transaction.accountId)
        ?.getAccountId()
    ) {
      throw new Error(ERROR_CODES.NO_ACCOUNT_ERROR);
    }
    this.transactions.push(transaction);
  }

  public getTransactions(
    yearMonthProps?: PrintStatementDateProps
  ): Transaction[] {
    if (yearMonthProps?.month && yearMonthProps?.year) {
      return this.transactions.filter((txn) => {
        return (
          txn.date.getFullYear() === yearMonthProps.year &&
          txn.date.getMonth() + 1 === yearMonthProps.month
        );
      });
    }
    return [...this.transactions];
  }

  getBalanceByDate(date: Date): number {
    return this.transactions
      .filter((txn) => txn.date <= date)
      .reduce((balance, txn) => {
        if (txn.type === TransactionType.WITHDRAWAL) {
          return balance - txn.amount;
        } else {
          return balance + txn.amount;
        }
      }, 0);
  }
}
