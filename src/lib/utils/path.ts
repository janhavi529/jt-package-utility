import path from "path";

import appRootPath from "app-root-path";

import { PathNotFound } from "../errors/NotFoundErrors";

/**
 * Check if file path is absolute or relative.
 * Return absolute file path.
 *
 * @param {String} filePath relative or absolute file path
 * @throws {PathNotFound} if unable to find path
 * @returns {String} absolute file path
 */
const getAbsoluteFilePath = (filePath: string): string => {
  if (!filePath) {
    throw new PathNotFound("Path does not exist");
  }

  const appRoot = appRootPath.toString();
  let absolutePath = "";

  // Split file path based on separator to make sure it is O.S. agnostic.
  const filePathArr = filePath.split(path.sep);

  if (filePath.includes(appRoot)) {
    absolutePath = path.join(...filePathArr);
  } else {
    // Get absolute file path by joining the application's root path.
    absolutePath = path.join(appRoot, ...filePathArr);
  }

  return absolutePath;
};

export { getAbsoluteFilePath };
