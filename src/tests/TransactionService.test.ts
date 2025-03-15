import { Transaction } from "../models/Transaction";
import { AccountService } from "../services/AccountService";
import { TransactionService } from "../services/TransactionService";
import { TransactionType } from "../util/constants";

describe("TransactionService", () => {
  let transactionService: TransactionService;
  let accountService: AccountService;

  beforeEach(() => {
    transactionService = new TransactionService();
    accountService = AccountService.getInstance();
  });

  test("should add transactions correctly", () => {
    const transaction = new Transaction(
      "20230101-01",
      new Date(2023, 0, 1),
      "AC001",
      TransactionType.DEPOSIT,
      100
    );

    transactionService.createTransaction(transaction);
    expect(transactionService.getTransactions()).toHaveLength(1);
  });

  test("should process valid transactions", () => {
    const date = new Date(2023, 5, 1); // June 1, 2023
    const transaction = transactionService.processTransaction(
      date,
      "AC001",
      TransactionType.DEPOSIT,
      100
    );

    expect(transaction.id).toBe("20230601-01");
    expect(transaction.accountId).toBe("AC001");
    expect(transaction.type).toBe(TransactionType.DEPOSIT);
    expect(transaction.amount).toBe(100);

    const account = accountService.getAccount("AC001");
    expect(account).toBeDefined();
    expect(transactionService!.getTransactions()).toHaveLength(1);
  });

  test("should reject transactions with different account IDs", () => {
    const transaction = new Transaction(
      "20230101-01",
      new Date(2023, 0, 1),
      "AC002", // Different account ID
      TransactionType.DEPOSIT,
      100
    );

    expect(() => transactionService.createTransaction(transaction)).toThrow();
  });

  test.only("should reject withdrawals that exceed balance", () => {
    const date = new Date(2023, 5, 1);

    // First deposit
    transactionService.processTransaction(
      date,
      "AC001",
      TransactionType.DEPOSIT,
      100
    );

    // Valid withdrawal
    expect(() => {
      transactionService.processTransaction(
        date,
        "AC001",
        TransactionType.WITHDRAWAL,
        50
      );
    }).not.toThrow();

    // Invalid withdrawal (exceeds balance)
    expect(() => {
      transactionService.processTransaction(
        date,
        "AC001",
        TransactionType.WITHDRAWAL,
        120
      );
    }).toThrow();
  });

  test("should generate sequential transaction IDs for the same date", () => {
    const date = new Date(2023, 5, 1);

    const txn1 = transactionService.processTransaction(
      date,
      "AC001",
      TransactionType.DEPOSIT,
      100
    );
    const txn2 = transactionService.processTransaction(
      date,
      "AC001",
      TransactionType.DEPOSIT,
      50
    );
    const txn3 = transactionService.processTransaction(
      date,
      "AC001",
      TransactionType.WITHDRAWAL,
      25
    );

    expect(txn1.id).toBe("20230601-01");
    expect(txn2.id).toBe("20230601-02");
    expect(txn3.id).toBe("20230601-03");
  });

  test("should calculate balance correctly", () => {
    // Initial deposit
    transactionService.createTransaction(
      new Transaction(
        "20230101-01",
        new Date(2023, 0, 1),
        "AC001",
        TransactionType.DEPOSIT,
        100
      )
    );

    // Another deposit
    transactionService.createTransaction(
      new Transaction(
        "20230102-01",
        new Date(2023, 0, 2),
        "AC001",
        TransactionType.DEPOSIT,
        50
      )
    );

    // Withdrawal
    transactionService.createTransaction(
      new Transaction(
        "20230103-01",
        new Date(2023, 0, 3),
        "AC001",
        TransactionType.WITHDRAWAL,
        30
      )
    );

    expect(transactionService.getBalanceByDate(new Date(2023, 0, 1))).toBe(100);
    expect(transactionService.getBalanceByDate(new Date(2023, 0, 2))).toBe(150);
    expect(transactionService.getBalanceByDate(new Date(2023, 0, 3))).toBe(120);
  });

  test("should filter transactions by month correctly", () => {
    // January transaction
    transactionService.createTransaction(
      new Transaction(
        "20230101-01",
        new Date(2023, 0, 1),
        "AC001",
        TransactionType.DEPOSIT,
        100
      )
    );

    // February transaction
    transactionService.createTransaction(
      new Transaction(
        "20230201-01",
        new Date(2023, 1, 1),
        "AC001",
        TransactionType.DEPOSIT,
        50
      )
    );

    const janTransactions = transactionService.getTransactions({
      year: 2023,
      month: 1,
    });
    const febTransactions = transactionService.getTransactions({
      year: 2023,
      month: 2,
    });

    expect(janTransactions).toHaveLength(1);
    expect(febTransactions).toHaveLength(1);
    expect(janTransactions[0].date.getMonth()).toBe(0); // January is 0
    expect(febTransactions[0].date.getMonth()).toBe(1); // February is 1
  });
});
