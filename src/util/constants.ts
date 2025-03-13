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

export const dateValidation = /^\d{4}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/;

export const amountValidation = /^\d+(\.\d{1,2})?$/;

export enum ERROR_CODES {
  INSUFFICIENT_DETAILS_ERROR = "Insufficient details",
  INVALID_DATE_ERROR = "Invalid date format. The date should be in YYYYMMdd format",
  INVALID_AMOUNT = "The amount has to be greater than 0",
  AMOUNT_FORMAT_ERROR = "Invalid format. The amount can not be more than 2 decimals",
}
