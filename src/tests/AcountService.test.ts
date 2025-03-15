import { AccountService } from "../services/AccountService";

describe("AccountService", () => {
  let accountService: AccountService;

  beforeEach(() => {
    accountService = AccountService.getInstance();
  });

  test("should create accounts when needed", () => {
    expect(accountService.getAccounts()).toHaveLength(0);

    const account = accountService.addAccount("AC001");
    expect(account).toBeDefined();
    expect(account!.getAccountId()).toBe("AC001");
    expect(accountService.getAccounts()).toHaveLength(1);

    // Getting the same account should not create a new one
    accountService.addAccount("AC001");
    expect(accountService.getAccounts()).toHaveLength(1);
  });
});
