import { DashaBlock, YoginiDasha, DashaLevel, YoginiLevel } from './schemas';

/**
 * Validate ISO UTC timestamp
 */
function isValidISOTimestamp(timestamp: string): boolean {
  try {
    const date = new Date(timestamp);
    return !isNaN(date.getTime()) && timestamp.includes('T') && timestamp.endsWith('Z');
  } catch {
    return false;
  }
}

/**
 * Validate dasha block timestamps and structure
 */
function validateDashaBlock(block: DashaBlock): string[] {
  const errors: string[] = [];
  
  if (!isValidISOTimestamp(block.start)) {
    errors.push(`Invalid start timestamp: ${block.start}`);
  }
  
  if (!isValidISOTimestamp(block.end)) {
    errors.push(`Invalid end timestamp: ${block.end}`);
  }
  
  if (isValidISOTimestamp(block.start) && isValidISOTimestamp(block.end)) {
    const startDate = new Date(block.start);
    const endDate = new Date(block.end);
    
    if (startDate >= endDate) {
      errors.push(`Start time must be before end time: ${block.start} >= ${block.end}`);
    }
  }
  
  return errors;
}

/**
 * Sort dasha blocks by start time
 */
function sortDashaBlocks<T extends { start: string }>(blocks: T[]): T[] {
  return [...blocks].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Trim children to fit within parent bounds
 */
function trimChildrenToParentBounds(
  children: DashaBlock[],
  parentStart: string,
  parentEnd: string
): DashaBlock[] {
  const parentStartTime = new Date(parentStart).getTime();
  const parentEndTime = new Date(parentEnd).getTime();
  
  return children.map(child => {
    const childStartTime = new Date(child.start).getTime();
    const childEndTime = new Date(child.end).getTime();
    
    // Clamp to parent bounds
    const clampedStart = Math.max(childStartTime, parentStartTime);
    const clampedEnd = Math.min(childEndTime, parentEndTime);
    
    // Only include if there's a valid time range after clamping
    if (clampedStart >= clampedEnd) {
      return null;
    }
    
    return {
      ...child,
      start: new Date(clampedStart).toISOString(),
      end: new Date(clampedEnd).toISOString(),
      children: child.children ? trimChildrenToParentBounds(child.children, child.start, child.end) : undefined
    };
  }).filter((child): child is DashaBlock => child !== null);
}

/**
 * Process Vimshottari dasha tree
 */
export function processVimshottariTree(
  vimshottari: DashaBlock[],
  fixes: string[]
): DashaBlock[] {
  if (!vimshottari || vimshottari.length === 0) return [];

  const processedTree: DashaBlock[] = [];

  for (const block of vimshottari) {
    const errors = validateDashaBlock(block);
    if (errors.length > 0) {
      fixes.push(`Vimshottari validation errors for ${block.name}: ${errors.join(', ')}`);
      continue;
    }

    let processedBlock: DashaBlock = { ...block };

    // Process children if they exist
    if (block.children && block.children.length > 0) {
      // Sort children by start time
      const sortedChildren = sortDashaBlocks(block.children);
      
      // Trim children to fit parent bounds
      const trimmedChildren = trimChildrenToParentBounds(sortedChildren, block.start, block.end);
      
      // Check if any children were modified (different start/end times)
      let childrenModified = false;
      for (let i = 0; i < Math.min(trimmedChildren.length, block.children.length); i++) {
        if (trimmedChildren[i].start !== block.children[i].start || 
            trimmedChildren[i].end !== block.children[i].end) {
          childrenModified = true;
          break;
        }
      }
      
      if (childrenModified) {
        fixes.push(`Trimmed children of ${block.name} to fit parent bounds`);
      }
      
      // Recursively process children
      const processedChildren = processVimshottariTree(trimmedChildren, fixes);
      processedBlock.children = processedChildren;
    }

    processedTree.push(processedBlock);
  }

  return sortDashaBlocks(processedTree);
}

/**
 * Process Yogini dasha tree (same logic as Vimshottari)
 */
export function processYoginiTree(
  yogini: YoginiDasha[],
  fixes: string[]
): YoginiDasha[] {
  if (!yogini || yogini.length === 0) return [];

  const processedTree: YoginiDasha[] = [];

  for (const block of yogini) {
    const errors = validateDashaBlock(block as DashaBlock);
    if (errors.length > 0) {
      fixes.push(`Yogini validation errors for ${block.name}: ${errors.join(', ')}`);
      continue;
    }

    let processedBlock: YoginiDasha = { ...block };

    // Process children if they exist
    if (block.children && block.children.length > 0) {
      // Sort children by start time
      const sortedChildren = sortDashaBlocks(block.children);
      
      // Trim children to fit parent bounds
      const trimmedChildren = trimChildrenToParentBounds(sortedChildren as DashaBlock[], block.start, block.end) as YoginiDasha[];
      
      if (trimmedChildren.length !== block.children.length) {
        fixes.push(`Trimmed ${block.children.length - trimmedChildren.length} children of ${block.name} to fit parent bounds`);
      }
      
      // Recursively process children
      const processedChildren = processYoginiTree(trimmedChildren, fixes);
      processedBlock.children = processedChildren;
    }

    processedTree.push(processedBlock);
  }

  return sortDashaBlocks(processedTree);
}

/**
 * Test cases for dasha tree processing
 */
export const DASHA_TREE_TESTS = {
  // Test timestamp validation
  timestampValidation: () => {
    const validBlock: DashaBlock = {
      name: "Test",
      lord: "Sun",
      start: "2020-01-01T00:00:00.000Z",
      end: "2021-01-01T00:00:00.000Z",
      level: "MAHA"
    };
    const errors = validateDashaBlock(validBlock);
    return errors.length === 0;
  },

  // Test invalid timestamp
  invalidTimestamp: () => {
    const invalidBlock: DashaBlock = {
      name: "Test",
      lord: "Sun",
      start: "invalid-date",
      end: "2021-01-01T00:00:00.000Z",
      level: "MAHA"
    };
    const errors = validateDashaBlock(invalidBlock);
    return errors.length > 0 && errors[0].includes("Invalid start timestamp");
  },

  // Test child trimming
  childTrimming: () => {
    const parent: DashaBlock = {
      name: "Parent",
      lord: "Sun",
      start: "2020-01-01T00:00:00.000Z",
      end: "2021-01-01T00:00:00.000Z",
      level: "MAHA",
      children: [
        {
          name: "Child1",
          lord: "Moon",
          start: "2019-12-01T00:00:00.000Z", // Before parent
          end: "2020-06-01T00:00:00.000Z",
          level: "ANTAR"
        },
        {
          name: "Child2",
          lord: "Mars",
          start: "2020-06-01T00:00:00.000Z",
          end: "2022-01-01T00:00:00.000Z", // After parent
          level: "ANTAR"
        }
      ]
    };
    
    const fixes: string[] = [];
    const processed = processVimshottariTree([parent], fixes);
    
    return processed.length === 1 && 
           processed[0].children?.length === 2 &&
           fixes.length > 0;
  }
};
