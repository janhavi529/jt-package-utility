import path from 'path';

import appRootPath from 'app-root-path';

import { Packer } from '../../src/components/Packer';
import { PackingError } from '../../src/lib/errors/PackingError';
import { FileNotFound } from '../../src/lib/errors/NotFoundErrors';
import {
  mockValidItems,
  mockValidItemsSameCost,
  mockValidPackageInputLine,
  mockInvalidNoWeightLimitLine,
  mockInvalidExceededPackageWeightLine,
  mockInvalidExceededItemWeightLine,
  mockInvalidExceededItemCostLine,
  mockInvalidExceededItemsCountLine,
  mockInvalidItemOptionsLine,
  mockInvalidNoItemOptionsLine,
  mockInvalidItemFormatLine
} from '../mocks/packer';

describe('Packer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPackageItems method', () => {
    test('should accept the package weight limit and array of items to return an array of items contributing to maximum cost while staying within the weight limit', () => {
      const mockWeightLimit = 75;

      const selectedItemIndices = Packer['getPackageItems'](
        mockWeightLimit,
        mockValidItems
      );

      expect(selectedItemIndices).toEqual([2, 7]);
    });

    test('should return item with less weight in case two items contribute the same cost to the package', () => {
      const mockWeightLimit = 75;

      const selectedItemIndices = Packer['getPackageItems'](
        mockWeightLimit,
        mockValidItemsSameCost
      );

      expect(selectedItemIndices).toEqual([2, 10]);
    });

    test('should return an empty array if there are no items passed', () => {
      const mockWeightLimit = 75;

      const selectedItemIndices = Packer['getPackageItems'](
        mockWeightLimit,
        []
      );

      expect(selectedItemIndices).toEqual([]);
    });
  });

  describe('getPackageDetailsFromFileLine method', () => {
    test('should return a comma separated string of selected items contributing to maximum cost of the package', () => {
      const packageDetails = Packer['getPackageDetailsFromFileLine'](
        mockValidPackageInputLine
      );

      expect(packageDetails).toEqual('2,7');
    });

    test('should return a "-" if there is no pattern match for the weight limit in the input line', () => {
      const packageDetails = Packer['getPackageDetailsFromFileLine'](
        mockInvalidNoWeightLimitLine
      );

      expect(packageDetails).toEqual('-');
    });

    test('should throw PackingError if the package weight exceeds 100', () => {
      const packingError = new PackingError('Package weight 101 exceeds 100');

      try {
        Packer['getPackageDetailsFromFileLine'](
          mockInvalidExceededPackageWeightLine
        );
      } catch (err) {
        expect(err).toEqual(packingError);
      }
    });

    test("should throw PackingError if an item's weight exceeds 100", () => {
      const packingError = new PackingError(
        'Item weight 101.31 (from package with weight limit 95) exceeds 100'
      );

      try {
        Packer['getPackageDetailsFromFileLine'](
          mockInvalidExceededItemWeightLine
        );
      } catch (err) {
        expect(err).toEqual(packingError);
      }
    });

    test("should throw PackingError if an item's cost exceeds €100", () => {
      const packingError = new PackingError(
        'Item cost €105 (from package with weight limit 65) exceeds €100'
      );

      try {
        Packer['getPackageDetailsFromFileLine'](
          mockInvalidExceededItemCostLine
        );
      } catch (err) {
        expect(err).toEqual(packingError);
      }
    });

    test('should throw PackingError if a number of items exceeds 15', () => {
      const packingError = new PackingError(
        'Number of items (16) (from package with weight limit 79) exceeds 15'
      );

      try {
        Packer['getPackageDetailsFromFileLine'](
          mockInvalidExceededItemsCountLine
        );
      } catch (err) {
        expect(err).toEqual(packingError);
      }
    });

    test("should return '-' if no items can be included in the package", () => {
      const packageDetails = Packer['getPackageDetailsFromFileLine'](
        mockInvalidItemOptionsLine
      );

      expect(packageDetails).toEqual('-');
    });

    test("should return a '-' if there is no pattern match for the item options in the input line", () => {
      const packageDetails = Packer['getPackageDetailsFromFileLine'](
        mockInvalidNoItemOptionsLine
      );

      expect(packageDetails).toEqual('-');
    });

    test("should return a '-' if there is no valid pattern match for the item options in the input line", () => {
      const packageDetails = Packer['getPackageDetailsFromFileLine'](
        mockInvalidItemFormatLine
      );

      expect(packageDetails).toEqual('-');
    });
  });

  describe('pack method', () => {
    test('should return details of all packages in the file (relative path) with items contributing to the maximum cost', async () => {
      const mockFilePath = ['tests', 'resources', 'input_valid'].join(path.sep);
      const mockOutput = [
        '4',
        '-',
        '2,7',
        '8,9',
        '2,3,6',
        '2,3,11,12,13,14',
        '2,3,4',
        '1,2,3'
      ].join('\n');

      const packerOutput = await Packer.pack(mockFilePath);

      expect(packerOutput).toEqual(mockOutput);
    });

    test('should return details of all packages in the file (absolute path) with items contributing to the maximum cost', async () => {
      const appRoot = appRootPath.toString();
      const filePathArr = ['tests', 'resources', 'input_valid'];
      const mockFilePath = path.join(appRoot, ...filePathArr);
      const mockOutput = [
        '4',
        '-',
        '2,7',
        '8,9',
        '2,3,6',
        '2,3,11,12,13,14',
        '2,3,4',
        '1,2,3'
      ].join('\n');

      const packerOutput = await Packer.pack(mockFilePath);

      expect(packerOutput).toEqual(mockOutput);
    });

    test('should throw FileNotFound if the input file does not exist', async () => {
      const appRoot = appRootPath.toString();
      const filePathArr = ['tests', 'resources', 'unknown'];
      const mockFilePath = path.join(appRoot, ...filePathArr);
      const fileNotFoundError = new FileNotFound(
        `File ${mockFilePath} does not exist`
      );

      await expect(Packer.pack(mockFilePath)).rejects.toThrow(
        fileNotFoundError
      );
    });

    test("should return '-' if no package weight limit is provided", async () => {
      const mockFilePath = [
        'tests',
        'resources',
        'input_invalid_no_package_weight'
      ].join(path.sep);

      const packerOutput = await Packer.pack(mockFilePath);

      expect(packerOutput).toEqual('-');
    });

    test("should return '-' if no package item options are provided", async () => {
      const mockFilePath = [
        'tests',
        'resources',
        'input_invalid_no_items'
      ].join(path.sep);

      const packerOutput = await Packer.pack(mockFilePath);

      expect(packerOutput).toEqual('-');
    });

    test("should return '-' if invalid item options are provided and correct selected items for items in correct format", async () => {
      const mockFilePath = [
        'tests',
        'resources',
        'input_invalid_item_format'
      ].join(path.sep);

      const packerOutput = await Packer.pack(mockFilePath);

      expect(packerOutput).toEqual(['3', '-'].join('\n'));
    });

    test('should reject with an error for invalid package weight', async () => {
      const mockFilePath = [
        'tests',
        'resources',
        'input_invalid_package_weight'
      ].join(path.sep);
      const packingError = new PackingError('Package weight 101 exceeds 100');

      await expect(Packer.pack(mockFilePath)).rejects.toThrow(packingError);
    });

    test('should reject with an error for invalid item weight', async () => {
      const mockFilePath = [
        'tests',
        'resources',
        'input_invalid_item_weight'
      ].join(path.sep);
      const packingError = new PackingError(
        'Item weight 101.31 (from package with weight limit 95) exceeds 100'
      );

      await expect(Packer.pack(mockFilePath)).rejects.toThrow(packingError);
    });

    test('should reject with an error for invalid item cost', async () => {
      const mockFilePath = [
        'tests',
        'resources',
        'input_invalid_item_cost'
      ].join(path.sep);
      const packingError = new PackingError(
        'Item cost €105 (from package with weight limit 65) exceeds €100'
      );

      await expect(Packer.pack(mockFilePath)).rejects.toThrow(packingError);
    });

    test('should reject with an error for invalid number of items', async () => {
      const mockFilePath = [
        'tests',
        'resources',
        'input_invalid_item_number'
      ].join(path.sep);
      const packingError = new PackingError(
        'Number of items (16) (from package with weight limit 79) exceeds 15'
      );

      await expect(Packer.pack(mockFilePath)).rejects.toThrow(packingError);
    });
  });
});
