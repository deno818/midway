# Card Pool Matcher - 卡池匹配算法

一个高效的卡池匹配算法实现，支持多种匹配策略，用于从卡池中找到满足特定总额要求的卡牌组合。

## 功能特性

- **三种匹配策略**：
  - **精确匹配 (exact)**：使用回溯算法找到总额恰好为目标值的组合
  - **贪心策略 (greedy)**：优先选择高价值卡牌，快速接近目标
  - **动态规划 (dynamic)**：使用动态规划寻找最优解

- **灵活的约束条件**：
  - 支持自定义目标总额（默认 1200）
  - 支持最大卡牌数量限制（默认 8 张）
  - 卡牌价格范围：50-500

- **强大的生成工具**：
  - 随机卡池生成器
  - 保证有解的卡池生成器
  - 无解的卡池生成器
  - 边界情况测试卡池
  - 大规模性能测试卡池

## 安装

```bash
tnpm i @midwayjs/security --save
```

## 快速开始

### 基本使用

```typescript
import {
  matchCards,
  generateCardPool,
  Card,
} from '@midwayjs/security';

// 定义卡牌接口
interface Card {
  id: string;
  name: string;
  price: number;
}

// 生成测试卡池
const cardPool = generateCardPool({
  minCards: 100,
  maxCards: 200,
  minPrice: 50,
  maxPrice: 500,
});

// 使用精确匹配策略
const result = matchCards(cardPool, 'exact', 1200, 8);

console.log('找到的卡牌:', result.matched);
console.log('总额:', result.total);
console.log('卡牌数量:', result.count);
console.log('执行时间:', result.timeMs, 'ms');
```

### 匹配策略对比

```typescript
import { matchCards, Card } from '@midwayjs/security';

const pool: Card[] = [
  { id: '1', name: 'Dragon', price: 500 },
  { id: '2', name: 'Phoenix', price: 400 },
  { id: '3', name: 'Wizard', price: 300 },
  // ... 更多卡牌
];

// 精确匹配 - 必须恰好达到目标金额
const exact = matchCards(pool, 'exact', 1200, 8);

// 贪心策略 - 优先选择高价值卡牌
const greedy = matchCards(pool, 'greedy', 1200, 8);

// 动态规划 - 寻找最优组合
const dynamic = matchCards(pool, 'dynamic', 1200, 8);
```

## API 文档

### 核心函数

#### matchCards

主匹配函数，支持所有策略。

```typescript
function matchCards(
  cardPool: Card[],
  strategy: MatchingStrategy,
  targetAmount?: number,
  maxCards?: number
): MatchResultDetailed
```

**参数**：
- `cardPool`: 卡牌数组
- `strategy`: 匹配策略 ('exact' | 'greedy' | 'dynamic')
- `targetAmount`: 目标总额（默认 1200）
- `maxCards`: 最大卡牌数量（默认 8）

**返回值**：
```typescript
interface MatchResultDetailed {
  matched: Card[];      // 匹配的卡牌列表
  total: number;         // 总金额
  count: number;         // 卡牌数量
  strategy: MatchingStrategy;  // 使用的策略
  timeMs: number;        // 执行时间（毫秒）
}
```

#### matchExact

精确匹配策略，使用回溯算法。

```typescript
function matchExact(
  cardPool: Card[],
  targetAmount?: number,
  maxCards?: number
): MatchResult | null
```

**特点**：
- 找到第一个满足条件的组合
- 如果没有精确匹配，返回 null
- 时间复杂度：O(2^n) 最坏情况
- 空间复杂度：O(n)

#### matchGreedy

贪心策略，优先选择高价值卡牌。

```typescript
function matchGreedy(
  cardPool: Card[],
  targetAmount?: number,
  maxCards?: number
): MatchResult
```

**特点**：
- 总是返回结果
- 不能保证找到最优解
- 时间复杂度：O(n log n)
- 空间复杂度：O(n)

#### matchDynamic

动态规划策略，寻找最优解。

```typescript
function matchDynamic(
  cardPool: Card[],
  targetAmount?: number,
  maxCards?: number
): MatchResult
```

**特点**：
- 找到最接近目标的组合
- 时间复杂度：O(n * maxCards * targetAmount)
- 空间复杂度：O(n * maxCards * targetAmount)

#### findAllMatches

查找所有可能的精确匹配组合。

```typescript
function findAllMatches(
  cardPool: Card[],
  targetAmount?: number,
  maxCards?: number
): MatchResult[]
```

**返回值**：所有可能的匹配组合数组

#### validateCardPool

验证卡池数据的有效性。

```typescript
function validateCardPool(cardPool: any): boolean
```

**验证规则**：
- 必须是数组且非空
- 每张卡牌必须有 id、name、price 属性
- 价格必须在 1-500 范围内

### 生成器函数

#### generateCardPool

生成随机卡池。

```typescript
function generateCardPool(options?: GenerateCardPoolOptions): Card[]
```

**选项**：
```typescript
interface GenerateCardPoolOptions {
  minCards?: number;      // 最小卡牌数（默认 50）
  maxCards?: number;      // 最大卡牌数（默认 200）
  minPrice?: number;      // 最小价格（默认 50）
  maxPrice?: number;      // 最大价格（默认 500）
  allowDuplicates?: boolean;  // 是否允许重复（默认 true）
  cardNames?: string[];   // 卡牌名称列表
}
```

#### generateSolvableCardPool

生成保证有解的卡池。

```typescript
function generateSolvableCardPool(
  targetAmount?: number,
  poolSize?: number,
  exactMatchCount?: number
): Card[]
```

**参数**：
- `targetAmount`: 目标金额（默认 1200）
- `poolSize`: 卡池大小（默认 100）
- `exactMatchCount`: 保证的解的数量（默认 5）

#### generateUnsolvableCardPool

生成无解的卡池（用于测试无解情况）。

```typescript
function generateUnsolvableCardPool(
  targetAmount?: number,
  poolSize?: number
): Card[]
```

#### generateLargeCardPool

生成大规模卡池（用于性能测试）。

```typescript
function generateLargeCardPool(size?: number): Card[]
```

#### generateEdgeCaseCardPool

生成边界情况测试卡池。

```typescript
function generateEdgeCaseCardPool(
  scenario: 'minimum' | 'maximum' | 'single' | 'boundary'
): Card[]
```

**场景类型**：
- `minimum`: 最小卡牌数（2 张）
- `maximum`: 最大卡牌数（8 张）
- `single`: 单张卡牌匹配
- `boundary`: 边界值测试

#### calculatePoolStatistics

计算卡池统计信息。

```typescript
function calculatePoolStatistics(pool: Card[]): {
  totalCards: number;
  totalPrice: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  priceDistribution: Record<number, number>;
}
```

## 使用示例

### 示例 1：游戏卡组匹配

```typescript
import { matchCards, generateCardPool } from '@midwayjs/security';

// 生成游戏卡池
const gameCards = generateCardPool({
  minCards: 150,
  maxCards: 200,
  minPrice: 50,
  maxPrice: 500,
  allowDuplicates: true,
});

// 寻找总战力为 1200 的卡组
const optimalDeck = matchCards(gameCards, 'dynamic', 1200, 8);

console.log('最优卡组:');
optimalDeck.matched.forEach(card => {
  console.log(`- ${card.name}: ${card.price}`);
});
```

### 示例 2：比较不同策略

```typescript
import { matchCards } from '@midwayjs/security';

const pool = [
  { id: '1', name: 'Card A', price: 500 },
  { id: '2', name: 'Card B', price: 400 },
  { id: '3', name: 'Card C', price: 300 },
  { id: '4', name: 'Card D', price: 200 },
  { id: '5', name: 'Card E', price: 100 },
];

const strategies = ['exact', 'greedy', 'dynamic'] as const;

strategies.forEach(strategy => {
  const result = matchCards(pool, strategy, 1200, 8);
  console.log(`${strategy} 策略:`);
  console.log(`  总额: ${result.total}`);
  console.log(`  卡牌数: ${result.count}`);
  console.log(`  执行时间: ${result.timeMs.toFixed(2)}ms`);
});
```

### 示例 3：查找所有可能组合

```typescript
import { findAllMatches } from '@midwayjs/security';

const pool = [
  { id: '1', name: 'Card A', price: 600 },
  { id: '2', name: 'Card B', price: 600 },
  { id: '3', name: 'Card C', price: 400 },
  { id: '4', name: 'Card D', price: 800 },
];

const allMatches = findAllMatches(pool, 1200, 8);

console.log(`找到 ${allMatches.length} 种组合:`);
allMatches.forEach((match, index) => {
  console.log(`\n组合 #${index + 1}:`);
  match.matched.forEach(card => {
    console.log(`  - ${card.name}: ${card.price}`);
  });
});
```

### 示例 4：性能测试

```typescript
import { matchCards, generateLargeCardPool } from '@midwayjs/security';

// 生成大规模卡池
const largePool = generateLargeCardPool(1000);

// 测试贪心策略性能
console.log('测试贪心策略...');
const greedyStart = performance.now();
const greedyResult = matchCards(largePool, 'greedy', 1200, 8);
const greedyTime = performance.now() - greedyStart;

console.log(`执行时间: ${greedyTime.toFixed(2)}ms`);
console.log(`结果: 总额=${greedyResult.total}, 卡牌数=${greedyResult.count}`);
```

## 运行测试

```bash
# 运行卡池匹配器测试
npm run test:cardpool

# 运行演示
npm run demo:cardpool
```

## 性能指标

基于测试结果的性能参考：

| 策略 | 卡池大小 | 平均执行时间 |
|------|---------|------------|
| exact | 100 | < 1ms |
| greedy | 1000 | < 20ms |
| dynamic | 500 | < 350ms |

## 算法复杂度

| 策略 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| exact | O(2^n) | O(n) |
| greedy | O(n log n) | O(n) |
| dynamic | O(n * m * t) | O(n * m * t) |

其中：
- n = 卡牌数量
- m = 最大卡牌数
- t = 目标金额

## 注意事项

1. **精确匹配策略**：
   - 在最坏情况下可能需要较长时间
   - 建议对卡牌进行预排序以提高性能
   - 适合中小规模卡池（< 500 张）

2. **动态规划策略**：
   - 内存消耗较大，不适合极大目标金额
   - 适合需要最优解的场景
   - 目标金额过大时可能性能下降

3. **贪心策略**：
   - 执行速度最快
   - 不保证找到最优解
   - 适合实时性要求高的场景

## License

MIT
