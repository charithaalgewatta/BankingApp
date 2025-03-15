import { InterestRule } from "../models/InterestRule";
import { Transaction } from "../models/Transaction";
import { PrintStatementDateProps, TransactionType } from "../util/constants";
import { formatYearMonth } from "../util/ServiceHelper";
import { TransactionService } from "./TransactionService";

export class InterestService {
  private interestRules: InterestRule[] = [];

  processInterestRule(date: Date, ruleId: string, rate: number): void {
    const interestRule = new InterestRule(date, ruleId, rate);
    this.createInterestRule(interestRule);
  }

  createInterestRule(interestRule: InterestRule): void {
    this.interestRules = this.interestRules.filter(
      (r) => r.date.getTime() !== interestRule.date.getTime()
    );
    this.interestRules.push(interestRule);
  }

  getInterestRules(): InterestRule[] {
    return [...this.interestRules].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }

  calculateInterest(
    year: number,
    month: number,
    transactionService: TransactionService
  ): number {
    const startOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0).getDate();

    let totalInterest = 0;
    let currentDate = startOfMonth;
    let prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);

    let currentBalance = transactionService.getBalanceByDate(prevDate);

    console.log("currentBalance", currentBalance);
    console.log("transactionService", transactionService.getTransactions());

    const monthTransactions = transactionService
      .getTransactions({
        month: year,
        year: month,
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    console.log("monthTransactions", monthTransactions);

    const transactionsByDate = new Map<string, Transaction[]>();
    monthTransactions.forEach((txn) => {
      const dateKey = formatYearMonth(txn.date);
      if (!transactionsByDate.has(dateKey)) {
        transactionsByDate.set(dateKey, []);
      }
      transactionsByDate.get(dateKey)!.push(txn);
    });

    let prevRuleIndex = this.getRuleDate(startOfMonth);
    let day = 1;

    while (day <= lastDayOfMonth) {
      currentDate = new Date(year, month - 1, day);
      const dateKey = formatYearMonth(currentDate);

      if (transactionsByDate.has(dateKey)) {
        transactionsByDate.get(dateKey)!.forEach((txn) => {
          if (txn.type === TransactionType.DEPOSIT) {
            currentBalance += txn.amount;
          } else if (txn.type === TransactionType.WITHDRAWAL) {
            currentBalance -= txn.amount;
          }
        });
      }

      const ruleIndex = this.getRuleDate(currentDate);
      const applicableRuleIndex = ruleIndex >= 0 ? ruleIndex : prevRuleIndex;
      prevRuleIndex = applicableRuleIndex;

      if (applicableRuleIndex >= 0) {
        const rule = this.interestRules[applicableRuleIndex];
        const dailyInterest = (currentBalance * rule.rate) / 100 / 365;
        totalInterest += dailyInterest;
      }

      day++;
    }

    return Math.round(totalInterest * 100) / 100;
  }

  private getRuleDate(date: Date): number {
    for (let i = this.interestRules.length - 1; i >= 0; i--) {
      if (this.interestRules[i].date <= date) {
        return i;
      }
    }
    return -1;
  }
}
