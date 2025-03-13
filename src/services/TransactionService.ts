import { Account } from "../models/Account";
import { Transaction } from "../models/Transaction";
import { TransactionType } from "../util/constants";
import { generateTransactionID } from "../util/TransactionServiceHelper";
import { AccountService } from "./AccountService";

export class TransactionService {
  private transactions: Transaction[] = [];
  private accountService: AccountService;

  constructor() {
    this.accountService = new AccountService();
  }

  processTransaction(
    date: Date,
    accountId: string,
    type: TransactionType,
    amount: number
  ): Transaction[] {
    const account = new Account(accountId);
    this.accountService.getAccount(accountId);

    const transactionId = generateTransactionID(this.transactions, date);
    const transaction = new Transaction(
      transactionId,
      date,
      accountId,
      type,
      amount
    );

    this.createTransaction(transaction);

    return this.transactions;
  }

  createTransaction(transaction: Transaction): Transaction[] {
    this.transactions.push(transaction);
    return this.transactions;
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }
}
