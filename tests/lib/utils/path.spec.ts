import path from "path";

import appRootPath from "app-root-path";

import { getAbsoluteFilePath } from "../../../src/lib/utils/path";
import { PathNotFound } from "../../../src/lib/errors/NotFoundErrors";

describe("Path Utils", () => {
  test("should return absolute file path", () => {
    const appRoot = appRootPath.toString();
    const filePathArr = ["tests", "resources", "input_valid"];
    const pathAppend = filePathArr.join(path.sep);
    const mockFilePath = `${appRoot}${path.sep}${pathAppend}`;

    const absolutePath = getAbsoluteFilePath(mockFilePath);

    expect(absolutePath).toEqual(path.join(appRoot, ...filePathArr));
  });

  test("should return absolute file path given the relative path", () => {
    const appRoot = appRootPath.toString();
    const filePathArr = ["tests", "resources", "input_valid"];

    const absolutePath = getAbsoluteFilePath(filePathArr.join(path.sep));

    expect(absolutePath).toEqual(path.join(appRoot, ...filePathArr));
  });

  test("should throw PathNotFound if the path is not passed", () => {
    const pathNotFoundError = new PathNotFound("Path does not exist");

    try {
      getAbsoluteFilePath("");
    } catch (err) {
      expect(err).toEqual(pathNotFoundError);
    }
  });
});
