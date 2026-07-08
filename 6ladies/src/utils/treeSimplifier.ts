import type { DecisionTreeNode } from "../types/game";

export type SimplifyOptions = {
  maxChildrenPerNode: number;
  initialDepth: number;
};

const DEFAULT_OPTIONS: SimplifyOptions = {
  maxChildrenPerNode: 3,
  initialDepth: 2
};

function hasCostNodeId(id: string): boolean {
  return id.endsWith("::cost");
}

function hasPositionNodeId(id: string): boolean {
  return id.includes("::pos-");
}

function isCostNode(node: DecisionTreeNode): boolean {
  return hasCostNodeId(node.id);
}

function nodeScore(node: DecisionTreeNode): number {
  return node.score ?? Infinity;
}

export function pruneTree(
  node: DecisionTreeNode,
  maxChildren: number
): DecisionTreeNode {
  if (!node.children || node.children.length === 0) {
    return { ...node, children: undefined };
  }

  const sorted = [...node.children].sort(
    (a, b) => nodeScore(a) - nodeScore(b)
  );

  const kept = sorted.slice(0, maxChildren);

  return {
    ...node,
    children: kept.map((child) => pruneTree(child, maxChildren))
  };
}

function collapseDeep(
  node: DecisionTreeNode,
  currentDepth: number,
  maxDepth: number
): DecisionTreeNode {
  const collapsed =
    currentDepth > maxDepth && node.id !== "root";

  return {
    ...node,
    collapsed: collapsed || undefined,
    children: node.children?.map((child) =>
      collapseDeep(child, currentDepth + 1, maxDepth)
    )
  };
}

function stripCostNodes(node: DecisionTreeNode): DecisionTreeNode {
  if (!node.children || node.children.length === 0) {
    return { ...node, children: undefined };
  }

  const filtered = node.children.filter(
    (child) => !isCostNode(child)
  );

  return {
    ...node,
    children: filtered.length > 0
      ? filtered.map(stripCostNodes)
      : undefined
  };
}

function truncateLabel(node: DecisionTreeNode, maxLen: number): DecisionTreeNode {
  const name =
    node.name.length > maxLen
      ? node.name.slice(0, maxLen - 1) + "…"
      : node.name;
  return { ...node, name };
}

export function simplifyTree(
  node: DecisionTreeNode,
  options: Partial<SimplifyOptions> = {}
): DecisionTreeNode {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let result = stripCostNodes(node);
  result = pruneTree(result, opts.maxChildrenPerNode);
  result = collapseDeep(result, 0, opts.initialDepth);
  result = truncateLabelRecursive(result, 28);

  return result;
}

function truncateLabelRecursive(
  node: DecisionTreeNode,
  maxLen: number
): DecisionTreeNode {
  const truncated = truncateLabel(node, maxLen);
  return {
    ...truncated,
    children: truncated.children?.map((child) =>
      truncateLabelRecursive(child, maxLen)
    )
  };
}

export function cloneTree(node: DecisionTreeNode): DecisionTreeNode {
  return {
    ...node,
    children: node.children?.map(cloneTree)
  };
}
