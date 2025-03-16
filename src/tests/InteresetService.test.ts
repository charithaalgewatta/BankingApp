import { Transaction } from "../models/Transaction";
import { AccountService } from "../services/AccountService";
import { InterestService } from "../services/InterestService";
import { TransactionService } from "../services/TransactionService";
import { TransactionType } from "../util/constants";

describe("InterestService", () => {
  let interestService: InterestService;
  let transactionService: TransactionService;
  let accountService: AccountService;

  beforeEach(() => {
    interestService = new InterestService();
    transactionService = new TransactionService();
    accountService = AccountService.getInstance();
    accountService.addAccount("AC001");
    transactionService.createTransaction(
      new Transaction(
        "20230501-01",
        new Date(2023, 4, 1),
        "AC001",
        TransactionType.DEPOSIT,
        100
      )
    );
  });

  test("should add and retrieve interest rules correctly", () => {
    interestService.processInterestRule(new Date(2023, 0, 1), "RULE01", 1.95);
    interestService.processInterestRule(new Date(2023, 4, 20), "RULE02", 1.9);

    const rules = interestService.getInterestRules();
    expect(rules).toHaveLength(2);
    expect(rules[0].ruleId).toBe("RULE01");
    expect(rules[1].ruleId).toBe("RULE02");
  });

  test("should replace rules with the same date", () => {
    interestService.processInterestRule(new Date(2023, 0, 1), "RULE01", 1.95);
    interestService.processInterestRule(new Date(2023, 0, 1), "RULE02", 1.9);

    const rules = interestService.getInterestRules();
    expect(rules).toHaveLength(1);
    expect(rules[0].ruleId).toBe("RULE02");
  });

  test("should calculate interest correctly with one rule", () => {
    interestService.processInterestRule(new Date(2023, 0, 1), "RULE01", 1.2);

    const interest = interestService.calculateInterest(
      2023,
      6,
      transactionService
    );

    expect(interest).toBeCloseTo(0.1, 2);
  });

  test("should calculate interest correctly with multiple rules", () => {
    interestService.processInterestRule(new Date(2023, 0, 1), "RULE01", 1.2);

    interestService.processInterestRule(new Date(2023, 5, 15), "RULE02", 1.8);

    const interest = interestService.calculateInterest(
      2023,
      6,
      transactionService
    );

    expect(interest).toBeCloseTo(0.12, 2);
  });
});
