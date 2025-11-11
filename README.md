# Dice String Comparison

This package provides an implementation of the Dice Coefficient algorithm, which is useful for measuring the similarity between two strings. It includes functions to compute the Dice Coefficient between two strings, as well as to find the top matches from an array of strings.

## Features

- Extremely fast Dice Coefficient calculation
- Optimized for comparing a string against large arrays
- Returns top-N matches with optional cutoff
- Fully typed for TypeScript
- Works with both ESM and CommonJS

## Installation

You can install the package using npm:

```
npm install dice-string-comparison
```

## Usage

### Importing the Package

You can import the functions and interface from the package as follows:

```javascript
import {
  diceCoefficient,
  diceCoefficientArray,
  diceCoefficientTopMatches,
  DiceMatch,
} from "dice-string-comparison";
```

### Functions

#### `diceCoefficient(str1: string, str2: string): number`

```javascript
const score = diceCoefficient("hello", "helo");
console.log(score); // 0.8
```

#### `diceCoefficientArray(str: string, arr: string[]): DiceMatch[]`

Computes the Dice Coefficient of one string against an array of strings.

**Parameters:**

- `str`: The string to compare.
- `arr`: An array of strings to compare against.

**Returns:** An array of `DiceMatch` objects, each containing the item and its corresponding score.

```javascript
const allScores = diceCoefficientArray("hello", ["hello", "world", "fuzzy"]);
console.log(allScores);
/*
[
  { item: 'hello', score: 1 },
  { item: 'world', score: 0 },
  { item: 'fuzzy', score: 0 }
]
*/
```

#### `diceCoefficientTopMatches(str: string, arr: string[], topN: number, cutoff: number): DiceMatch[]`

Returns the top N matches above a given cutoff score.

**Parameters:**

- `str`: The string to compare.
- `arr`: An array of strings to compare against.
- `topN`: The number of top matches to return (default is 5).
- `cutoff`: The minimum score for a match to be included (default is 0).

**Returns:** An array of `DiceMatch` objects for the top matches.

```javascript
const topMatches = diceCoefficientTopMatches(
  "hello",
  ["hello", "world", "fuzzy"],
  2,
  0.5
);
console.log(topMatches);
/*
[
  { item: 'hello', score: 1 }
]
*/
```

## Performance

Benchmark for 100 samples

| Function                            | Ops/sec |
| ----------------------------------- | ------- |
| diceCoefficient                     | 2076    |
| string-similarity.compareTwoStrings | 1182    |
| diceCoefficientArray                | 192     |
| string-similarity.findBestMatch     | 113     |

## License

This project is licensed under the MIT License.
