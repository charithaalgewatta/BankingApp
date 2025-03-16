import * as readline from "readline";
import { App } from "../../src/ui/App";

describe("App", () => {
  let app: App;
  let rl: readline.Interface;

  beforeEach(() => {
    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    app = new App();
  });

  afterEach(() => {
    rl.close();
    jest.restoreAllMocks();
  });

  test("should display the greeting and the main menu options", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    app.start();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Welcome to AwesomeGIC Bank! What would you like to do?"
    );
    (app as any).showMainMenu();
    expect(consoleSpy).toHaveBeenCalledWith("[T] Input transactions");
    expect(consoleSpy).toHaveBeenCalledWith("[I] Define interest rules");
    expect(consoleSpy).toHaveBeenCalledWith("[P] Print statement");
    expect(consoleSpy).toHaveBeenCalledWith("[Q] Quit");
    consoleSpy.mockRestore();
  });

  test("should handle invalid option", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const questionSpy = jest
      .spyOn(rl, "question")
      .mockImplementation(
        (_: string, __: any, cb: (answer: string) => void) => {
          cb("X");
          expect(consoleSpy).toHaveBeenCalledWith(
            "Invalid Option, Please select a valid option"
          );
        }
      );
    consoleSpy.mockRestore();
    questionSpy.mockRestore();
  });

  test("should handle input transaction option", () => {
    const handleInputTransactionSpy = jest
      .spyOn(app as any, "handleInputTransaction")
      .mockImplementation();
    const questionSpy = jest
      .spyOn(rl, "question")
      .mockImplementation(
        (_: string, __: any, cb: (answer: string) => void) => {
          cb("T");
          expect(handleInputTransactionSpy).toHaveBeenCalled();
        }
      );
    app["showMainMenu"]();

    handleInputTransactionSpy.mockRestore();
    questionSpy.mockRestore();
  });

  test("should handle interest rules option", () => {
    const handleInterestRulesSpy = jest
      .spyOn(app as any, "handleInterestRules")
      .mockImplementation();
    const questionSpy = jest
      .spyOn(rl, "question")
      .mockImplementation(
        (_: string, __: any, cb: (answer: string) => void) => {
          cb("I");
          expect(handleInterestRulesSpy).toHaveBeenCalled();
        }
      );
    handleInterestRulesSpy.mockRestore();
    questionSpy.mockRestore();
  });

  test("should handle print statement option", () => {
    const handlePrintStatementSpy = jest
      .spyOn(app as any, "handlePrintStatement")
      .mockImplementation();
    const questionSpy = jest
      .spyOn(rl, "question")
      .mockImplementation(
        (_: string, __: any, cb: (answer: string) => void) => {
          cb("P");
          expect(handlePrintStatementSpy).toHaveBeenCalled();
        }
      );
    handlePrintStatementSpy.mockRestore();
    questionSpy.mockRestore();
  });

  test("should handle quit option", () => {
    const handleQuitSpy = jest
      .spyOn(app as any, "handleQuit")
      .mockImplementation();
    const questionSpy = jest
      .spyOn(rl, "question")
      .mockImplementation(
        (_: string, __: any, cb: (answer: string) => void) => {
          cb("Q");
          expect(handleQuitSpy).toHaveBeenCalled();
        }
      );
    handleQuitSpy.mockRestore();
    questionSpy.mockRestore();
  });
});
