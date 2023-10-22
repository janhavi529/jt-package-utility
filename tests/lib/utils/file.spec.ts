import path from "path";

import appRootPath from "app-root-path";

import { checkIfFileExists } from "../../../src/lib/utils/file";
import { FileNotFound } from "../../../src/lib/errors/NotFoundErrors";

describe("File Utils", () => {
  test("should return true if the file exists", () => {
    const appRoot = appRootPath.toString();
    const filePathArr = ["tests", "resources", "input_valid"];
    const mockFilePath = path.join(appRoot, ...filePathArr);

    const isFileExists = checkIfFileExists(mockFilePath);

    expect(isFileExists).toBeTruthy();
  });

  test("should throw FileNotFound if the file does not exist", () => {
    const appRoot = appRootPath.toString();
    const filePathArr = ["tests", "resources", "unknown"];
    const mockFilePath = path.join(appRoot, ...filePathArr);
    const fileNotFoundError = new FileNotFound(
      `File ${mockFilePath} does not exist`
    );

    try {
      checkIfFileExists(mockFilePath);
    } catch (err) {
      expect(err).toEqual(fileNotFoundError);
    }
  });
});
