import path from "path";
import fs from "fs";
import readline from "readline";

import appRootPath from "app-root-path";

import pathUtils from '../lib/utils/path';
import { PackingError } from "../lib/errors/PackingError";
import notFoundErrors from "../lib/errors/NotFoundErrors";

// Using an interface to define the item object type.
interface ItemObj {
  index: number;
  weight: number;
  cost: number;
}

export class Packer {
  /**
   * Read the file input which contains maximum weight for each package and item options.
   * Determine which items to put into each package so that the total weight is less than or equal to the package weight limit and the total cost is as large as possible.
   *
   * @param {String} filePath relative or absolute file path
   * @throws {PackingError} if unable to pack
   * @returns {Promise<String>} solution
   */
  static async pack(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Get absolute file path.
      const absoluteInputPath = pathUtils.getAbsoluteFilePath(filePath);

      // Check if the input file exists.
      if (!fs.existsSync(absoluteInputPath)) {
        throw new notFoundErrors.FileNotFound(
          `File ${absoluteInputPath} does not exist`
        );
      }

      // Set the output file path to /resources/output.
      const absoluteOutputPath = path.join(appRootPath.toString(), "resources", "output");

      // Create read and write streams (default encoding is utf8).
      const readStream = fs.createReadStream(absoluteInputPath);
      const writeStream = fs.createWriteStream(absoluteOutputPath);

      // Use readline interface for reading data from the file stream one line at a time,
      // Instead of synchronously loading the entire file before reading any lines, which consumes more memory.
      const rl = readline.createInterface({
        input: readStream,
        output: writeStream,
        crlfDelay: Infinity, // Identify all instances of \r\n as a single newline.
      });

      const packages: Array<string> = [];

      // Process each line from the file.
      rl.on("line", (line) => {
        const packageDetails = this.getPackageDetailsFromFileLine(line);
        // Write the line to the output file.
        writeStream.write(packageDetails + "\n");
        packages.push(packageDetails);
      });

      rl.on("close", () => {
        if (!writeStream.closed) {
          // End write stream after all output lines are written.
          writeStream.end();
        }

        // Return string of package details.
        const packagesOutput = packages.join("\n");
        resolve(packagesOutput);
      });

      rl.on("error", (err) => {
        reject(err);
      });
    });
  }

  /**
   * Accept a line from the input file and return a string containing items contributing to maximum package cost.
   *
   * @param {String} line line from input file
   * @throws {PackingError} if unable to pack
   * @returns {String} package items separated by a comma (or "-" if there are no items)
   */
  static getPackageDetailsFromFileLine(line: string): string {
    // Extract package weight limit from the line.
    const weightLimitMatch = line.match(/(\d+) :/);
    const weightLimit = weightLimitMatch ? parseInt(weightLimitMatch[1]) : 0;

    // Throw an error if package weight limit is greater than 100.
    if (weightLimit > 100) {
      throw new PackingError(`Package weight ${weightLimit} exceeds 100`);
    }

    // Extract items from the line.
    const itemRegex = /\(\d+,\d+\.\d+,\€\d+\)/g;
    const matchedItems = line.match(itemRegex);

    if (matchedItems && matchedItems.length) {
      // Form an array of item objects with index, weight and cost.
      const items = matchedItems.reduce(
        (accum: Array<ItemObj>, itemStr: string) => {
          const itemStringMatch = itemStr.match(/(\d+),([\d.]+),\€(\d+)/);

          if (itemStringMatch && itemStringMatch.length) {
            // Extract the item's index, weight and cost.
            const item = {
              index: parseInt(itemStringMatch[1]),
              weight: parseFloat(itemStringMatch[2]),
              cost: parseInt(itemStringMatch[3]),
            };

            // Throw an error if item weight is greater than 100.
            if (item.weight > 100) {
              throw new PackingError(
                `Item weight ${item.weight} (from package with weight limit ${weightLimit}) exceeds 100`
              );
            }

            // Throw an error if item cost is greater than €100.
            if (item.cost > 100) {
              throw new PackingError(
                `Item cost €${item.cost} (from package with weight limit ${weightLimit}) exceeds €100`
              );
            }

            accum.push(item);
          }

          return accum;
        },
        [] as Array<ItemObj>
      );

      // Throw an error if number of items is greater than 15.
      if (items.length > 15) {
        throw new PackingError(
          `Number of items (${items.length}) (from package with weight limit ${weightLimit}) exceeds 15`
        );
      }

      // Algorithm to get list of items contributing to maximum package cost while staying within the package weight limit.
      const packageItems = this.getPackageItems(weightLimit, items);

      // Return item indices in the required string format e.g. '4', '-', '2,7', '8,9'
      if (packageItems.length) {
        return packageItems.join(",");
      } else {
        return "-";
      }
    }

    // Return "-" by default if there are no items provided in the input line.
    return "-";
  }

  /**
   * Use dynamic programming to determine which things to put into the package so that the total weight is less than or equal to the package limit and the total cost is as large as possible.
   *
   * @param {Number} weightLimit line from input file
   * @param {Array} items array of items containing index, weight and cost.
   * @throws {PackingError} if unable to pack
   * @returns {Array} selected package items
   */
  static getPackageItems(
    weightLimit: number,
    items: Array<ItemObj>
  ): Array<number> {
    try {
      const n = items.length;

      // Sort items by weight in ascending order to start calculating with lighter items.
      items.sort((a, b) => a.weight - b.weight);

      /* Using Dynamic Programming Approach
       * Memoization - To keep a track of previous maximum cost calculations and use cached results for further iterations.
       * This is better than using a recursive approach, which has very high exponential time complexity due to repetitive calculations.
       */

      //  Using Tabulation - Creating a 2D Array to keep track of the maximum cost for each combination of items.
      const trackedCosts = new Array(n + 1)
        .fill(0)
        .map(() => new Array(weightLimit + 1).fill(0));

      // For each item (row), loop through each column which contains weights from 0 to weightLimit and apply maximum cost calculation logic.
      for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= weightLimit; j++) {
          if (i === 0 || j === 0) {
            trackedCosts[i][j] = 0;
          } else if (items[i - 1].weight <= j) {
            // If the item weighs less than the weight 'j', we can make a choice whether to add the item to the package or not, based on the maximum cost calculation below.
            // Go to previous row which contains maximum costs till now. Get the cost for the previous item for remaining weight (subtracting item's weight from the allowed weight 'j').
            const previousMaximumCost =
              trackedCosts[i - 1][j - Math.floor(items[i - 1].weight)];
            const costIfIncluded = items[i - 1].cost + previousMaximumCost;
            // If the item is not included, get the maximum cost for the previous item row for the same weight 'j'.
            const costIfNotIncluded = trackedCosts[i - 1][j]; // Memoization

            trackedCosts[i][j] = Math.max(costIfIncluded, costIfNotIncluded);
          } else {
            // If the current item's weight is greater than the allowed weight 'j', it cannot be included. Set the previous maximum cost.
            trackedCosts[i][j] = trackedCosts[i - 1][j]; // Memoization
          }
        }
      }

      // Backtrack through the trackedCosts array to get selected items.
      const selectedItemIndices = [];
      let j = weightLimit;
      for (let i = n; i > 0 && j > 0; i--) {
        // Checking if the previous item's maximum cost is the same. If so, The current item is not the item which has contributed to the maximum cost, so move up to the previous row.
        if (trackedCosts[i][j] !== trackedCosts[i - 1][j]) {
          // Add the previous item index to the selected items.
          selectedItemIndices.push(items[i - 1].index);
          // Update the remaining weight.
          j -= Math.floor(items[i - 1].weight);
        }
      }

      // Sort the selected items indices array in ascending order as the output is expected in a sorted format.
      return selectedItemIndices.sort((a, b) => a - b);
    } catch (err) {
      throw new PackingError(
        "Unable to get list of items contributing to maximum cost."
      );
    }
  }
}

