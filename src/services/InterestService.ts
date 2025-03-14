import { InterestRule } from "../models/InterestRule";

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
}
