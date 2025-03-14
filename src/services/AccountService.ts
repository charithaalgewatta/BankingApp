import { Account } from "../models/Account";

export class AccountService {
  private Accounts: Map<string, Account> = new Map();

  public addAccount(accountId: string) {
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
}
