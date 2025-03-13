import { TransactionType } from "../util/constants";

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly date: Date,
    public readonly accountId: string,
    public readonly type: TransactionType,
    public readonly amount: number
  ) {}
}
