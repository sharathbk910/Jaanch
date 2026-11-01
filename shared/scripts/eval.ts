import { CORPUS_FIXTURES } from '../src/__fixtures__/corpus/fixtures.js';
import { analyzeOffer } from '../src/index.js';
import type { VerificationStatus } from '../src/schemas/index.js';

const CLASSES: VerificationStatus[] = [
  'LIKELY_GENUINE',
  'NEEDS_REVIEW',
  'HIGH_CONCERN',
  'CONFIRMED_SCAM',
];

interface ClassMetrics {
  tp: number;
  fp: number;
  fn: number;
  precision: number;
  recall: number;
  f1: number;
}

export function runEvaluation(): boolean {
  console.log('===============================================================');
  console.log('         JAANCH SHARED CORE – 25 CORPUS EVALUATION             ');
  console.log('===============================================================\n');

  // Matrix: [actualIndex][predictedIndex]
  const matrix: number[][] = Array.from({ length: CLASSES.length }, () =>
    Array(CLASSES.length).fill(0)
  );

  let correctCount = 0;
  const total = CORPUS_FIXTURES.length;
  const mismatches: { id: string; name: string; expected: string; actual: string }[] = [];

  console.log('--- Individual Fixture Evaluation ---');
  for (const fixture of CORPUS_FIXTURES) {
    const res = analyzeOffer(fixture.request);
    const actual = res.status;
    const expected = fixture.expectedStatus;

    const actualIdx = CLASSES.indexOf(expected);
    const predIdx = CLASSES.indexOf(actual);

    if (actualIdx >= 0 && predIdx >= 0) {
      matrix[actualIdx][predIdx]++;
    }

    const isMatch = actual === expected;
    if (isMatch) {
      correctCount++;
      console.log(`[PASS] ${fixture.id} | ${fixture.name.padEnd(36)} -> ${actual}`);
    } else {
      mismatches.push({ id: fixture.id, name: fixture.name, expected, actual });
      console.error(
        `[FAIL] ${fixture.id} | ${fixture.name.padEnd(36)} -> Expected: ${expected}, Got: ${actual}`
      );
    }
  }

  console.log('\n--- Confusion Matrix ---');
  console.log('Rows: Actual Class | Columns: Predicted Class\n');
  const header = 'Actual \\ Pred'.padEnd(16) + CLASSES.map((c) => c.slice(0, 10).padEnd(12)).join('');
  console.log(header);
  console.log('-'.repeat(header.length));

  for (let i = 0; i < CLASSES.length; i++) {
    const rowName = CLASSES[i].slice(0, 14).padEnd(16);
    const rowCounts = matrix[i].map((cnt) => cnt.toString().padEnd(12)).join('');
    console.log(rowName + rowCounts);
  }

  console.log('\n--- Per-Class Performance Metrics ---');
  console.log(
    'Status'.padEnd(18) +
      'TP'.padEnd(6) +
      'FP'.padEnd(6) +
      'FN'.padEnd(6) +
      'Precision'.padEnd(12) +
      'Recall'.padEnd(12) +
      'F1 Score'.padEnd(10)
  );
  console.log('-'.repeat(70));

  for (let i = 0; i < CLASSES.length; i++) {
    const c = CLASSES[i];
    const tp = matrix[i][i];
    let fp = 0;
    let fn = 0;

    for (let j = 0; j < CLASSES.length; j++) {
      if (j !== i) {
        fp += matrix[j][i];
        fn += matrix[i][j];
      }
    }

    const precision = tp + fp === 0 ? 1.0 : tp / (tp + fp);
    const recall = tp + fn === 0 ? 1.0 : tp / (tp + fn);
    const f1 =
      precision + recall === 0 ? 0.0 : (2 * precision * recall) / (precision + recall);

    console.log(
      c.padEnd(18) +
        tp.toString().padEnd(6) +
        fp.toString().padEnd(6) +
        fn.toString().padEnd(6) +
        (precision * 100).toFixed(1).padEnd(12) +
        (recall * 100).toFixed(1).padEnd(12) +
        (f1 * 100).toFixed(1).padEnd(10)
    );
  }

  const accuracy = (correctCount / total) * 100;
  console.log('\n===============================================================');
  console.log(`Summary: ${correctCount}/${total} Passed (${accuracy.toFixed(1)}% Accuracy)`);
  console.log('===============================================================\n');

  if (mismatches.length > 0) {
    console.error(`Evaluation failed with ${mismatches.length} mismatch(es).`);
    return false;
  }

  console.log('Evaluation PASSED: All 25 fixtures matched their expected status.');
  return true;
}

const isMain = process.argv[1] && process.argv[1].includes('eval');
if (isMain) {
  const ok = runEvaluation();
  process.exit(ok ? 0 : 1);
}
