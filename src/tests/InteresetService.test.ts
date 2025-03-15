import { Transaction } from "../models/Transaction";
import { InterestService } from "../services/InterestService";
import { TransactionService } from "../services/TransactionService";
import { TransactionType } from "../util/constants";

describe("InterestService", () => {
  let interestService: InterestService;
  let transactionService: TransactionService;

  beforeEach(() => {
    interestService = new InterestService();
    transactionService = new TransactionService();

    // Add initial balance in previous month
    transactionService.createTransaction(
      new Transaction(
        "20230501-01",
        new Date(2023, 4, 1), // May 1
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
    // Add a single interest rule effective from January
    interestService.processInterestRule(
      new Date(2023, 0, 1),
      "RULE01",
      1.2 // 1.2% annual interest
    );

    // June has 30 days
    // Interest calculation: 100 * 1.2% * 30 / 365 = 0.0986 rounded to 0.10
    const interest = interestService.calculateInterest(
      2023,
      6,
      transactionService
    );

    // With proper rounding to 2 decimal places
    expect(interest).toBeCloseTo(0.1, 2);
  });

  test("should calculate interest correctly with multiple rules", () => {
    // Add two interest rules
    interestService.processInterestRule(new Date(2023, 0, 1), "RULE01", 1.2);

    interestService.processInterestRule(
      new Date(2023, 5, 15), // June 15
      "RULE02",
      1.8 // 1.8% annual interest
    );

    // First 14 days: 100 * 1.2% * 14 / 365 = 0.046
    // Last 16 days: 100 * 1.8% * 16 / 365 = 0.079
    // Total: 0.125 rounded to 0.13
    const interest = interestService.calculateInterest(
      2023,
      6,
      transactionService
    );

    expect(interest).toBeCloseTo(0.12, 2);
  });
});
