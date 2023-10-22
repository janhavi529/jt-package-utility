import fs from "fs";

import { FileNotFound } from "../errors/NotFoundErrors";

/**
 * Check if file exists.
 *
 * @param {String} absolutePath absolute file path
 * @throws {FileNotFound} if unable to find file
 * @returns {Boolean} if file exists
 */
const checkIfFileExists = (absolutePath: string): boolean => {
  // Check if the file exists.
  if (!fs.existsSync(absolutePath)) {
    throw new FileNotFound(`File ${absolutePath} does not exist`);
  }

  return true;
};

export { checkIfFileExists };
