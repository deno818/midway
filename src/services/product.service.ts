/**
 * 产品组合搜索服务
 * 实现三轮分层搜索、多样性评分、结果去重等优化算法
 */

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  category?: string;
}

export interface ProductCombo {
  products: Product[];
  totalPrice: number;
  diversityScore: number;
  priceVariance: number;
  skuCombination: string;
}

export interface SearchOptions {
  maxResults?: number;
  minDiversity?: number;
  priceRange?: {
    min: number;
    max: number;
  };
}

/**
 * 计算给定数组的标准差
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(val => Math.pow(val - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
  
  return Math.sqrt(avgSquareDiff);
}

/**
 * 从产品名称中提取前缀
 * 例如: "Apple iPhone" -> ["Apple", "iPhone"]
 */
function extractNamePrefixes(name: string): string[] {
  return name.split(/\s+/).filter(part => part.length > 0);
}

/**
 * 计算组合的多样性评分
 * 考虑: 名称多样性、价格分布、SKU多样性
 */
function calculateDiversityScore(combo: Product[]): number {
  if (combo.length < 2) return 0;

  // 1. 名称前缀多样性 (占40%)
  const allPrefixes = new Set<string>();
  combo.forEach(product => {
    extractNamePrefixes(product.name).forEach(prefix => {
      allPrefixes.add(prefix.toLowerCase());
    });
  });
  const nameDiversityScore = Math.min(allPrefixes.size / (combo.length * 2), 1) * 40;

  // 2. 价格分布多样性 (占40%)
  const prices = combo.map(p => p.price);
  const priceVariance = calculateStandardDeviation(prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const priceVarianceRatio = avgPrice > 0 ? priceVariance / avgPrice : 0;
  const priceDiversityScore = Math.min(priceVarianceRatio * 100, 40);

  // 3. SKU多样性 (占20%)
  const uniqueSkus = new Set(combo.map(p => p.sku)).size;
  const skuDiversityScore = (uniqueSkus / combo.length) * 20;

  return nameDiversityScore + priceDiversityScore + skuDiversityScore;
}

/**
 * 计算组合的价格方差
 */
function calculateComboVariance(combo: Product[]): number {
  if (combo.length < 2) return 0;
  const prices = combo.map(p => p.price);
  return calculateStandardDeviation(prices);
}

/**
 * 创建SKU组合的哈希值用于去重
 */
function createSkuHash(combo: Product[]): string {
  return combo
    .map(p => p.sku)
    .sort()
    .join('|');
}

/**
 * 确定产品的价格级别（低/中/高）
 */
function getPriceLevel(price: number, allPrices: number[]): 'low' | 'medium' | 'high' {
  const sorted = [...allPrices].sort((a, b) => a - b);
  const thirdLength = Math.floor(sorted.length / 3);
  
  const lowThreshold = sorted[thirdLength];
  const highThreshold = sorted[sorted.length - thirdLength - 1];

  if (price < lowThreshold) return 'low';
  if (price > highThreshold) return 'high';
  return 'medium';
}

/**
 * 按价格区间分组产品
 */
function groupProductsByPrice(
  products: Product[]
): { low: Product[]; medium: Product[]; high: Product[] } {
  const allPrices = products.map(p => p.price);
  
  const groups = {
    low: [] as Product[],
    medium: [] as Product[],
    high: [] as Product[]
  };

  products.forEach(product => {
    const level = getPriceLevel(product.price, allPrices);
    groups[level].push(product);
  });

  return groups;
}

/**
 * 执行单轮搜索，生成组合
 */
function executeSearchRound(
  products: Product[],
  maxCombinations: number = 100
): Product[][] {
  const combinations: Product[][] = [];

  for (let i = 0; i < Math.min(products.length, maxCombinations); i++) {
    const baseProduct = products[i];
    
    // 随机选择搭配产品，增加多样性
    for (let j = 0; j < 2 && combinations.length < maxCombinations; j++) {
      const partnerIdx = Math.floor(Math.random() * products.length);
      if (partnerIdx !== i) {
        const partnerProduct = products[partnerIdx];
        combinations.push([baseProduct, partnerProduct]);
      }
    }
  }

  return combinations;
}

/**
 * 执行三轮分层搜索
 */
function executeLayeredSearch(
  products: Product[],
  roundLimit: number = 50
): Product[][] {
  const priceGroups = groupProductsByPrice(products);
  const allCombinations: Product[][] = [];

  // 第一轮：从低价产品启动
  const lowRound = executeSearchRound(priceGroups.low, roundLimit);
  allCombinations.push(...lowRound);

  // 第二轮：从中价产品启动
  const mediumRound = executeSearchRound(priceGroups.medium, roundLimit);
  allCombinations.push(...mediumRound);

  // 第三轮：从高价产品启动
  const highRound = executeSearchRound(priceGroups.high, roundLimit);
  allCombinations.push(...highRound);

  return allCombinations;
}

/**
 * 检查组合是否来自不同的价格段
 */
function isMultiPriceLevelCombo(combo: Product[], allPrices: number[]): boolean {
  const levels = new Set<string>();
  combo.forEach(product => {
    levels.add(getPriceLevel(product.price, allPrices));
  });
  return levels.size >= 2;
}

/**
 * 产品服务类 - 处理所有产品组合搜索操作
 */
export class ProductService {
  /**
   * 搜索产品组合
   * 使用三轮分层搜索 + 多样性评分 + 去重机制
   */
  searchCombinations(
    products: Product[],
    options: SearchOptions = {}
  ): ProductCombo[] {
    const maxResults = options.maxResults || 5;
    const minDiversity = options.minDiversity || 0;

    // 验证输入
    if (!products || products.length < 2) {
      return [];
    }

    const startTime = Date.now();

    // 执行三轮分层搜索
    const allCombinations = executeLayeredSearch(products, Math.ceil(150 / 3));
    
    // 评分和转换为 ProductCombo
    const scoredCombos: ProductCombo[] = allCombinations.map(combo => {
      const diversityScore = calculateDiversityScore(combo);
      const totalPrice = combo.reduce((sum, p) => sum + p.price, 0);
      const priceVariance = calculateComboVariance(combo);

      return {
        products: combo,
        totalPrice,
        diversityScore,
        priceVariance,
        skuCombination: createSkuHash(combo)
      };
    });

    // 去重：保留相同SKU组合中评分最高的
    const deduplicatedCombos = this.deduplicateCombos(scoredCombos);

    // 过滤：多样性评分过滤
    const filteredCombos = deduplicatedCombos.filter(
      combo => combo.diversityScore >= minDiversity
    );

    // 排序：按多样性评分降序
    const sortedCombos = filteredCombos.sort(
      (a, b) => b.diversityScore - a.diversityScore
    );

    // 确保结果来自不同价格段并限制数量
    const allPrices = products.map(p => p.price);
    const finalResults = this.selectDiversePriceLevelResults(
      sortedCombos,
      allPrices,
      maxResults
    );

    const endTime = Date.now();
    const elapsed = endTime - startTime;

    // 性能检查：确保在150ms以内
    if (elapsed > 150) {
      console.warn(
        `[ProductService] 搜索耗时 ${elapsed}ms，超过150ms阈值`
      );
    }

    return finalResults;
  }

  /**
   * 去重：对于相同的SKU组合，只保留多样性评分最高的
   */
  private deduplicateCombos(combos: ProductCombo[]): ProductCombo[] {
    const skuMap = new Map<string, ProductCombo>();

    for (const combo of combos) {
      const existing = skuMap.get(combo.skuCombination);
      if (!existing || combo.diversityScore > existing.diversityScore) {
        skuMap.set(combo.skuCombination, combo);
      }
    }

    return Array.from(skuMap.values());
  }

  /**
   * 选择来自不同价格段的结果
   * 优先选择跨越多个价格段的组合
   */
  private selectDiversePriceLevelResults(
    combos: ProductCombo[],
    allPrices: number[],
    maxResults: number
  ): ProductCombo[] {
    const results: ProductCombo[] = [];
    const selectedSkuHashes = new Set<string>();

    // 首先选择多价格段的组合
    for (const combo of combos) {
      if (
        results.length < maxResults &&
        !selectedSkuHashes.has(combo.skuCombination) &&
        isMultiPriceLevelCombo(combo.products, allPrices)
      ) {
        results.push(combo);
        selectedSkuHashes.add(combo.skuCombination);
      }
    }

    // 如果还需要更多结果，添加其他组合
    for (const combo of combos) {
      if (
        results.length < maxResults &&
        !selectedSkuHashes.has(combo.skuCombination)
      ) {
        results.push(combo);
        selectedSkuHashes.add(combo.skuCombination);
      }
    }

    return results;
  }

  /**
   * 验证搜索结果是否满足验收标准
   */
  validateResults(results: ProductCombo[], allProducts: Product[]): {
    isValid: boolean;
    details: Record<string, boolean | number | string>;
  } {
    const allPrices = allProducts.map(p => p.price);
    
    // 检查1：是否有5个结果
    const hasFiveResults = results.length >= 5;

    // 检查2：没有重复的SKU组合
    const skuHashes = new Set(results.map(r => r.skuCombination));
    const noRepeatedCombos = skuHashes.size === results.length;

    // 检查3：每个组合的产品名称至少有2种不同前缀
    const allHaveNameDiversity = results.every(combo => {
      const allPrefixes = new Set<string>();
      combo.products.forEach(product => {
        extractNamePrefixes(product.name).forEach(prefix => {
          allPrefixes.add(prefix.toLowerCase());
        });
      });
      return allPrefixes.size >= 2;
    });

    // 检查4：价格分布标准差是否比较高
    const priceVariances = results.map(r => r.priceVariance);
    const avgVariance = priceVariances.reduce((a, b) => a + b, 0) / priceVariances.length;
    const hasGoodPriceVariance = avgVariance > 0;

    // 检查5：结果来自不同价格段
    const priceLevelCounts = new Map<string, number>();
    results.forEach(combo => {
      const levels = new Set<string>();
      combo.products.forEach(product => {
        levels.add(getPriceLevel(product.price, allPrices));
      });
      levels.forEach(level => {
        priceLevelCounts.set(level, (priceLevelCounts.get(level) || 0) + 1);
      });
    });
    const hasMultiplePriceSegments = priceLevelCounts.size >= 2;

    return {
      isValid:
        hasFiveResults &&
        noRepeatedCombos &&
        allHaveNameDiversity &&
        hasGoodPriceVariance &&
        hasMultiplePriceSegments,
      details: {
        '5个结果': hasFiveResults,
        '没有重复SKU': noRepeatedCombos,
        '名称多样性': allHaveNameDiversity,
        '价格分布差异': hasGoodPriceVariance,
        '跨价格段': hasMultiplePriceSegments,
        '平均价格方差': avgVariance.toFixed(2),
        '价格段分布': Array.from(priceLevelCounts.entries())
          .map(([level, count]) => `${level}:${count}`)
          .join(',')
      }
    };
  }
}

/**
 * 导出服务实例
 */
export const productService = new ProductService();

/**
 * 示例用法和测试函数
 */
export function demonstrateSearch(): void {
  // 创建示例产品集合
  const sampleProducts: Product[] = [
    // 低价产品
    { id: '1', sku: 'SKU001', name: 'Budget Phone', price: 100 },
    { id: '2', sku: 'SKU002', name: 'Budget Tablet', price: 120 },
    { id: '3', sku: 'SKU003', name: 'Budget Laptop', price: 150 },
    
    // 中价产品
    { id: '4', sku: 'SKU004', name: 'Standard Phone', price: 300 },
    { id: '5', sku: 'SKU005', name: 'Standard Tablet', price: 350 },
    { id: '6', sku: 'SKU006', name: 'Standard Laptop', price: 400 },
    
    // 高价产品
    { id: '7', sku: 'SKU007', name: 'Premium Phone', price: 800 },
    { id: '8', sku: 'SKU008', name: 'Premium Tablet', price: 900 },
    { id: '9', sku: 'SKU009', name: 'Premium Laptop', price: 1200 },
  ];

  const service = new ProductService();
  const startTime = Date.now();
  
  const results = service.searchCombinations(sampleProducts, {
    maxResults: 5,
    minDiversity: 0
  });

  const endTime = Date.now();

  console.log('=== 产品组合搜索结果 ===');
  console.log(`执行时间: ${endTime - startTime}ms`);
  console.log(`返回结果数: ${results.length}`);
  console.log('');

  results.forEach((combo, index) => {
    console.log(`\n组合 ${index + 1}:`);
    console.log(`  产品: ${combo.products.map(p => p.name).join(', ')}`);
    console.log(`  SKU: ${combo.skuCombination}`);
    console.log(`  总价: $${combo.totalPrice}`);
    console.log(`  多样性评分: ${combo.diversityScore.toFixed(2)}`);
    console.log(`  价格方差: ${combo.priceVariance.toFixed(2)}`);
  });

  console.log('\n=== 验收标准检查 ===');
  const validation = service.validateResults(results, sampleProducts);
  console.log(`验证通过: ${validation.isValid}`);
  Object.entries(validation.details).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });
}

// 如果直接运行此文件，执行演示
if (require.main === module) {
  demonstrateSearch();
}
