export class InterestRule {
  constructor(
    public readonly date: Date,
    public readonly ruleId: string,
    public readonly rate: number
  ) {}
}
