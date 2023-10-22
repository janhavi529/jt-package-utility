const mockValidItems = [{
    index: 1,
    weight: 85.31,
    cost: 29
},
{
    index: 2,
    weight: 14.55,
    cost: 74
},
{
    index: 3,
    weight: 3.98,
    cost: 16
},{
    index: 4,
    weight: 26.24,
    cost: 55
},
{
    index: 5,
    weight: 63.69,
    cost: 52
},
{
    index: 6,
    weight: 76.25,
    cost: 75
},
{
    index: 7,
    weight: 60.02,
    cost: 74
},{
    index: 8,
    weight: 93.18,
    cost: 35
},
{
    index: 9,
    weight: 89.95,
    cost: 78
}];

const mockValidItemsSameCost = [...mockValidItems,
{
    index: 10,
    weight: 60.00,
    cost: 74
}];

const mockValidPackageInputLine = '75 : (1,85.31,€29) (2,14.55,€74) (3,3.98,€16) (4,26.24,€55) (5,63.69,€52) (6,76.25,€75) (7,60.02,€74) (8,93.18,€35) (9,89.95,€78)';
const mockInvalidNoWeightLimitLine = ' : (1,90.72,€13) (2,33.80,€40) (3,43.15,€10)';
const mockInvalidExceededPackageWeightLine = '101 : (1,53.38,€45) (2,88.62,€98) (3,78.48,€3) (4,72.30,€76) (5,30.18,€9) (6,46.34,€48)';
const mockInvalidExceededItemWeightLine = '95 : (1,101.31,€29) (2,14.55,€74) (3,3.98,€16) (4,26.24,€55)';
const mockInvalidExceededItemCostLine = '65 : (1,54.31,€29) (2,14.55,€74) (3,3.98,€16) (4,26.24,€105)';
const mockInvalidExceededItemsCountLine = '79 : (1,85.31,€29) (2,14.55,€74) (3,3.98,€16) (4,26.24,€55) (5,63.69,€52) (6,76.25,€75) (7,60.02,€74) (8,93.18,€35) (9,89.95,€78) (10,85.32,€19) (11,14.45,€74) (12,3.78,€66) (13,26.14,€59) (14,13.69,€50) (15,76.25,€75) (16,60.02,€74)';
const mockInvalidItemOptionsLine = '8 : (1,15.3,€34)';
const mockInvalidNoItemOptionsLine = '80 : ';

const packerMocks = {
    mockValidItems,
    mockValidItemsSameCost,
    mockValidPackageInputLine,
    mockInvalidNoWeightLimitLine,
    mockInvalidExceededPackageWeightLine,
    mockInvalidExceededItemWeightLine,
    mockInvalidExceededItemCostLine,
    mockInvalidExceededItemsCountLine,
    mockInvalidItemOptionsLine,
    mockInvalidNoItemOptionsLine
};

export default packerMocks;