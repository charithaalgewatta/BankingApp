import { Transaction } from "../models/Transaction";
import { PrintStatementDateProps } from "./constants";

export const parseDate = (dateStr: string): Date => {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6));
  const day = parseInt(dateStr.substring(6, 8));
  const date = new Date(year, month - 1, day);
  return date;
};

export const parseDateForInterest = (
  dateString: string
): PrintStatementDateProps => {
  const year = parseInt(dateString.substring(0, 4));
  const month = parseInt(dateString.substring(4, 6));
  return { year, month };
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}${month < 10 ? "0" + month : month}${
    day < 10 ? "0" + day : day
  }`;
};

export const generateTransactionID = (
  transactions: Transaction[],
  date: Date
): string => {
  if (transactions.length === 0) {
    return `${formatDate(date)}-01`;
  }

  const latestTxnNumber = Number(
    transactions
      .map((transaction: Transaction) => {
        return transaction.id.split("-")[1];
      })
      .sort((a, b) => parseInt(b) - parseInt(a))[0]
  );

  const transactionId = latestTxnNumber + 1;
  return `
      ${formatDate(date)}-${
    transactionId < 10 ? "0" + transactionId : transactionId.toString()
  }`;
};
