export class Account {
  constructor(private readonly accountId: string) {}

  public getAccountId(): string {
    return this.accountId;
  }
}
