export enum InputType {
  INPUT_TRANSACTION = "T",
  INTEREST_RULES = "I",
  PRINT_STATEMENT = "P",
  QUIT = "Q",
}

export enum TransactionType {
  DEPOSIT = "D",
  WITHDRAWAL = "W",
}

export type PrintStatementDateProps = {
  month: number;
  year: number;
};

export const dateValidation = /^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/;

export const amountValidation = /^\d+(\.\d{1,2})?$/;

export enum ERROR_CODES {
  INSUFFICIENT_DETAILS_ERROR = "Insufficient details. One or more fields are missing",
  INVALID_DATE_FORMAT_ERROR = "Invalid date format. The date should be in YYYYMMdd format",
  INVALID_DATE_ERROR = "Invalid date. The date should be less than or equal to today's date",
  INVALID_AMOUNT = "The amount has to be greater than 0",
  INVALID_INTEREST_AMOUNT = "The amount has to be greater than 0 and less than 100",
  AMOUNT_FORMAT_ERROR = "Invalid format. The amount can not be more than 2 decimals",
  INVALID_TXN_TYPE_ERROR = "Invalid transaction type. Please enter D for deposit or W for withdrawal",
  ERROR = "An error occurred. Please try again",
  NO_ACCOUNT_ERROR = "Account does not exist. Please create an account first",
  INSUFFICIENT_FUNDS_ERROR = "Insufficient funds for withdrawal",
}
