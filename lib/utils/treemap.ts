import type { TreemapRect, TreemapItem, Appeal } from "@/lib/types";

/**
 * Squarified Treemap Algorithm
 * Creates a treemap layout where each item's area is proportional to its value
 */
export function squarify(
  items: TreemapItem[],
  x: number,
  y: number,
  width: number,
  height: number
): TreemapRect[] {
  if (items.length === 0) return [];

  if (items.length === 1) {
    return [
      {
        x,
        y,
        width,
        height,
        data: items[0].data,
        percentage: items[0].percentage,
      },
    ];
  }

  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const rects: TreemapRect[] = [];

  // Determine if we should split horizontally or vertically
  const isWide = width >= height;

  // Find the best split point using the squarified algorithm
  let bestRatio = Infinity;
  let bestSplit = 1;

  for (let i = 1; i <= items.length; i++) {
    const rowItems = items.slice(0, i);
    const rowValue = rowItems.reduce((sum, item) => sum + item.value, 0);
    const rowFraction = rowValue / totalValue;

    // Calculate the dimension of this row
    const rowSize = isWide ? width * rowFraction : height * rowFraction;
    const crossSize = isWide ? height : width;

    // Calculate aspect ratios for items in this row
    let maxRatio = 0;
    for (const item of rowItems) {
      const itemFraction = item.value / rowValue;
      const itemCrossSize = crossSize * itemFraction;
      const ratio = Math.max(rowSize / itemCrossSize, itemCrossSize / rowSize);
      maxRatio = Math.max(maxRatio, ratio);
    }

    if (maxRatio < bestRatio) {
      bestRatio = maxRatio;
      bestSplit = i;
    } else {
      // Aspect ratios are getting worse, use previous split
      break;
    }
  }

  // Layout the first row
  const rowItems = items.slice(0, bestSplit);
  const remainingItems = items.slice(bestSplit);
  const rowValue = rowItems.reduce((sum, item) => sum + item.value, 0);
  const rowFraction = rowValue / totalValue;

  if (isWide) {
    const rowWidth = width * rowFraction;
    let currentY = y;

    for (const item of rowItems) {
      const itemFraction = item.value / rowValue;
      const itemHeight = height * itemFraction;

      rects.push({
        x,
        y: currentY,
        width: rowWidth,
        height: itemHeight,
        data: item.data,
        percentage: item.percentage,
      });

      currentY += itemHeight;
    }

    // Recurse on remaining items
    if (remainingItems.length > 0) {
      rects.push(
        ...squarify(remainingItems, x + rowWidth, y, width - rowWidth, height)
      );
    }
  } else {
    const rowHeight = height * rowFraction;
    let currentX = x;

    for (const item of rowItems) {
      const itemFraction = item.value / rowValue;
      const itemWidth = width * itemFraction;

      rects.push({
        x: currentX,
        y,
        width: itemWidth,
        height: rowHeight,
        data: item.data,
        percentage: item.percentage,
      });

      currentX += itemWidth;
    }

    // Recurse on remaining items
    if (remainingItems.length > 0) {
      rects.push(
        ...squarify(remainingItems, x, y + rowHeight, width, height - rowHeight)
      );
    }
  }

  return rects;
}

/**
 * Calculate treemap layout from appeals data
 */
export function calculateTreemapLayout(
  appeals: Appeal[],
  totalPledged: number
): TreemapRect[] {
  const items: TreemapItem[] = appeals.map((appeal) => ({
    data: appeal,
    value: appeal.totalPledged,
    percentage: (appeal.totalPledged / totalPledged) * 100,
  }));

  // Use 100x100 as the base unit, we'll convert to percentages
  return squarify(items, 0, 0, 100, 100);
}






