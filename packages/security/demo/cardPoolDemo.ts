import { matchCards, Card, MatchResultDetailed } from '../src/cardPoolMatcher';
import {
  generateCardPool,
  generateSolvableCardPool,
  generateUnsolvableCardPool,
  generateEdgeCaseCardPool,
  calculatePoolStatistics,
} from '../src/generateCardPool';

/**
 * Demo function showing card pool matcher functionality
 */
export function demo(): void {
  console.log('=== Card Pool Matcher Demo ===\n');

  // Demo 1: Basic matching with generated pool
  console.log('--- Demo 1: Basic Matching ---');
  const pool1 = generateSolvableCardPool(1200, 100, 3);
  console.log(`Generated pool with ${pool1.length} cards`);
  const stats1 = calculatePoolStatistics(pool1);
  console.log(
    `Pool stats: avg price=${stats1.averagePrice.toFixed(2)}, min=${
      stats1.minPrice
    }, max=${stats1.maxPrice}`
  );
  console.log();

  const exact1 = matchCards(pool1, 'exact', 1200, 8);
  const greedy1 = matchCards(pool1, 'greedy', 1200, 8);
  const dynamic1 = matchCards(pool1, 'dynamic', 1200, 8);

  console.log('Exact match result:');
  printMatchResult(exact1);
  console.log();

  console.log('Greedy match result:');
  printMatchResult(greedy1);
  console.log();

  console.log('Dynamic match result:');
  printMatchResult(dynamic1);
  console.log();

  // Demo 2: Compare all strategies
  console.log('--- Demo 2: Strategy Comparison ---');
  const pool2: Card[] = [
    { id: '1', name: 'Dragon', price: 500 },
    { id: '2', name: 'Phoenix', price: 400 },
    { id: '3', name: 'Wizard', price: 300 },
    { id: '4', name: 'Knight', price: 200 },
    { id: '5', name: 'Archer', price: 100 },
    { id: '6', name: 'Warrior', price: 150 },
    { id: '7', name: 'Mage', price: 250 },
    { id: '8', name: 'Berserker', price: 350 },
  ];
  console.log(`Test pool with ${pool2.length} cards:`);
  pool2.forEach(card => console.log(`  - ${card.name}: ${card.price}`));
  console.log();

  const strategies = ['exact', 'greedy', 'dynamic'] as const;
  console.log('Comparison of all strategies:');
  strategies.forEach(strategy => {
    const result = matchCards(pool2, strategy, 1200, 8);
    console.log(`\n${strategy.toUpperCase()} Strategy:`);
    printMatchResult(result);
  });
  console.log();

  // Demo 3: Edge cases
  console.log('--- Demo 3: Edge Cases ---');

  // Minimum case (2 cards)
  console.log('\nMinimum cards (2):');
  const minPool = generateEdgeCaseCardPool('minimum');
  const minResult = matchCards(minPool, 'exact', 1200, 8);
  printMatchResult(minResult);

  // Maximum case (8 cards)
  console.log('\nMaximum cards (8):');
  const maxPool = generateEdgeCaseCardPool('maximum');
  const maxResult = matchCards(maxPool, 'exact', 1200, 8);
  printMatchResult(maxResult);

  // Single card case
  console.log('\nSingle card match:');
  const singlePool = generateEdgeCaseCardPool('single');
  const singleResult = matchCards(singlePool, 'exact', 1200, 8);
  printMatchResult(singleResult);
  console.log();

  // Demo 4: Unsolvable pool
  console.log('--- Demo 4: Unsolvable Pool ---');
  const unsolvablePool = generateUnsolvableCardPool(1200, 50);
  console.log(`Generated unsolvable pool with ${unsolvablePool.length} cards`);
  const unsolvableResult = matchCards(unsolvablePool, 'exact', 1200, 8);
  console.log('Exact match result:');
  printMatchResult(unsolvableResult);
  console.log();

  console.log('Greedy match result (closest approximation):');
  const greedyUnsolvable = matchCards(unsolvablePool, 'greedy', 1200, 8);
  printMatchResult(greedyUnsolvable);
  console.log();

  // Demo 5: Large pool performance
  console.log('--- Demo 5: Large Pool Performance ---');
  const largePoolSize = 1000;
  console.log(`Generating large pool with ${largePoolSize} cards...`);
  const largePool = generateCardPool({
    minCards: largePoolSize,
    maxCards: largePoolSize,
  });

  const largeStats = calculatePoolStatistics(largePool);
  console.log(
    `Pool stats: ${
      largeStats.totalCards
    } cards, avg price=${largeStats.averagePrice.toFixed(2)}`
  );

  console.log('\nRunning greedy strategy on large pool...');
  const largeGreedyResult = matchCards(largePool, 'greedy', 1200, 8);
  printMatchResult(largeGreedyResult);

  console.log('\nRunning dynamic strategy on large pool...');
  const largeDynamicResult = matchCards(largePool, 'dynamic', 1200, 8);
  printMatchResult(largeDynamicResult);
  console.log();

  // Demo 6: Find all matches
  console.log('--- Demo 6: Find All Exact Matches ---');
  const findPool: Card[] = [
    { id: '1', name: 'Card1', price: 600 },
    { id: '2', name: 'Card2', price: 600 },
    { id: '3', name: 'Card3', price: 400 },
    { id: '4', name: 'Card4', price: 800 },
    { id: '5', name: 'Card5', price: 400 },
    { id: '6', name: 'Card6', price: 200 },
    { id: '7', name: 'Card7', price: 1000 },
    { id: '8', name: 'Card8', price: 200 },
  ];

  console.log(`Pool with ${findPool.length} cards:`);
  findPool.forEach(card => console.log(`  - ${card.name}: ${card.price}`));

  const { findAllMatches } = require('../src/cardPoolMatcher');
  const allMatches = findAllMatches(findPool, 1200, 8);
  console.log(`\nFound ${allMatches.length} exact match combinations:`);
  allMatches.forEach((match: any, index: number) => {
    console.log(
      `\nMatch #${index + 1} (${match.count} cards, total: ${match.total}):`
    );
    match.matched.forEach((card: Card) =>
      console.log(`  - ${card.name}: ${card.price}`)
    );
  });
  console.log();

  // Demo 7: Different target amounts
  console.log('--- Demo 7: Different Target Amounts ---');
  const targetPool: Card[] = [
    { id: '1', name: 'Card1', price: 100 },
    { id: '2', name: 'Card2', price: 200 },
    { id: '3', name: 'Card3', price: 300 },
    { id: '4', name: 'Card4', price: 400 },
    { id: '5', name: 'Card5', price: 500 },
  ];

  const targets = [600, 800, 1000, 1200];
  targets.forEach(target => {
    const result = matchCards(targetPool, 'exact', target, 8);
    console.log(`\nTarget: ${target}`);
    printMatchResult(result);
  });
  console.log();

  console.log('=== Demo Complete ===');
}

/**
 * Helper function to print match result
 */
function printMatchResult(result: MatchResultDetailed): void {
  console.log(`  Strategy: ${result.strategy}`);
  console.log(`  Cards found: ${result.count}`);
  console.log(`  Total: ${result.total}`);
  console.log(`  Execution time: ${result.timeMs.toFixed(2)}ms`);
  if (result.matched.length > 0) {
    console.log('  Selected cards:');
    result.matched.forEach(card => {
      console.log(`    - ${card.name} (id: ${card.id}): ${card.price}`);
    });
  } else {
    console.log('  No cards matched');
  }
}

// Run demo if executed directly
if (require.main === module) {
  demo();
}
