import { Account } from "../models/Account";

export class AccountService {
  private static instance: AccountService;
  private Accounts: Map<string, Account> = new Map();

  private constructor() {}

  public static getInstance(): AccountService {
    if (!AccountService.instance) {
      AccountService.instance = new AccountService();
    }
    return AccountService.instance;
  }

  public addAccount(accountId: string): Account | undefined {
    if (!this.Accounts.has(accountId)) {
      this.createAccount(accountId);
    }
    return this.Accounts.get(accountId);
  }

  private createAccount(accountId: string): void {
    this.Accounts.set(accountId, new Account(accountId));
  }

  public getAccount(accountId: string): Account | undefined {
    if (!this.Accounts.has(accountId)) {
      throw new Error("Account not found");
    }
    return this.Accounts.get(accountId);
  }

  public getAccounts(): Account[] {
    return [...this.Accounts.values()];
  }
}
