import { describe, expect, it } from "vitest";
import type { DecisionTreeNode } from "../types/game";
import { simplifyTree, pruneTree } from "./treeSimplifier";

function makeMoveNode(id: string, score: number, children?: DecisionTreeNode[]): DecisionTreeNode {
  return {
    id,
    name: `Move ${id}`,
    score,
    children
  };
}

function makePositionNode(id: string, children?: DecisionTreeNode[]): DecisionTreeNode {
  return {
    id,
    name: `Pos ${id}`,
    children
  };
}

function makeCostNode(id: string): DecisionTreeNode {
  return {
    id: `${id}::cost`,
    name: "Coste 2.5"
  };
}

function countNodes(node: DecisionTreeNode): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

function maxDepth(node: DecisionTreeNode): number {
  if (!node.children || node.children.length === 0) return 0;
  return 1 + Math.max(...node.children.map(maxDepth));
}

describe("pruneTree", () => {
  it("keeps all children when under the limit", () => {
    const root: DecisionTreeNode = {
      id: "root",
      name: "root",
      children: [
        makeMoveNode("a", 1),
        makeMoveNode("b", 2)
      ]
    };
    const pruned = pruneTree(root, 5);
    expect(pruned.children).toHaveLength(2);
  });

  it("keeps only the best N children by score", () => {
    const root: DecisionTreeNode = {
      id: "root",
      name: "root",
      children: [
        makeMoveNode("a", 10),
        makeMoveNode("b", 2),
        makeMoveNode("c", 5),
        makeMoveNode("d", 8)
      ]
    };
    const pruned = pruneTree(root, 2);
    expect(pruned.children).toHaveLength(2);
    expect(pruned.children![0].id).toBe("b");
    expect(pruned.children![1].id).toBe("c");
  });

  it("handles nodes without score by treating them as infinite", () => {
    const root: DecisionTreeNode = {
      id: "root",
      name: "root",
      children: [
        makeMoveNode("a", 1),
        { id: "no-score", name: "no score" }
      ]
    };
    const pruned = pruneTree(root, 1);
    expect(pruned.children).toHaveLength(1);
    expect(pruned.children![0].id).toBe("a");
  });

  it("prunes recursively", () => {
    const deepChild: DecisionTreeNode = {
      id: "deep",
      name: "deep",
      children: [
        makeMoveNode("d1", 10),
        makeMoveNode("d2", 20),
        makeMoveNode("d3", 30)
      ]
    };
    const root: DecisionTreeNode = {
      id: "root",
      name: "root",
      children: [
        makeMoveNode("a", 1, [deepChild])
      ]
    };
    const pruned = pruneTree(root, 2);
    expect(pruned.children![0].children![0].children).toHaveLength(2);
  });

  it("returns node unchanged if no children", () => {
    const leaf: DecisionTreeNode = { id: "leaf", name: "leaf" };
    const result = pruneTree(leaf, 3);
    expect(result.children).toBeUndefined();
  });
});

describe("simplifyTree", () => {
  it("removes cost nodes", () => {
    const root: DecisionTreeNode = {
      id: "root",
      name: "root",
      children: [
        {
          ...makeMoveNode("m1", 1),
          children: [makeCostNode("m1")]
        },
        {
          ...makeMoveNode("m2", 2),
          children: [makeCostNode("m2")]
        }
      ]
    };
    const simplified = simplifyTree(root, { maxChildrenPerNode: 5, initialDepth: 5 });
    expect(countNodes(simplified)).toBe(3);
  });

  it("collapses nodes beyond initialDepth", () => {
    const root: DecisionTreeNode = {
      id: "root",
      name: "root",
      children: [
        makeMoveNode("m1", 1, [
          makePositionNode("p1", [
            makeMoveNode("m2", 1, [
              makePositionNode("p2", [
                makeMoveNode("m3", 1)
              ])
            ])
          ])
        ])
      ]
    };
    const simplified = simplifyTree(root, { maxChildrenPerNode: 5, initialDepth: 2 });
    expect(simplified.children![0].collapsed).toBeUndefined();
    const pos1 = simplified.children![0].children![0];
    expect(pos1.collapsed).toBeUndefined();
    const m2 = pos1.children![0];
    expect(m2.collapsed).toBe(true);
  });

  it("limits children per node to maxChildrenPerNode", () => {
    const root: DecisionTreeNode = {
      id: "root",
      name: "root",
      children: Array.from({ length: 10 }, (_, i) =>
        makeMoveNode(`m${i}`, i)
      )
    };
    const simplified = simplifyTree(root, { maxChildrenPerNode: 3, initialDepth: 5 });
    expect(simplified.children).toHaveLength(3);
    expect(simplified.children![0].id).toBe("m0");
    expect(simplified.children![1].id).toBe("m1");
    expect(simplified.children![2].id).toBe("m2");
  });

  it("truncates long labels", () => {
    const root: DecisionTreeNode = {
      id: "root",
      name: "root",
      children: [
        { id: "long", name: "a7 -> b8 -> c9 -> d10 -> e11" }
      ]
    };
    const simplified = simplifyTree(root, { maxChildrenPerNode: 5, initialDepth: 5 });
    expect(simplified.children![0].name.length).toBeLessThanOrEqual(28);
  });

  it("applies default options when none given", () => {
    const root: DecisionTreeNode = {
      id: "root",
      name: "root",
      children: Array.from({ length: 10 }, (_, i) =>
        makeMoveNode(`m${i}`, i)
      )
    };
    const simplified = simplifyTree(root);
    expect(simplified.children).toHaveLength(3);
  });

  it("does not collapse root", () => {
    const root: DecisionTreeNode = {
      id: "root",
      name: "root",
      children: [
        makeMoveNode("m1", 1, [
          makePositionNode("p1", [
            makeMoveNode("m2", 1)
          ])
        ])
      ]
    };
    const simplified = simplifyTree(root, { maxChildrenPerNode: 5, initialDepth: 1 });
    expect(simplified.collapsed).toBeUndefined();
    expect(simplified.children![0].collapsed).toBeUndefined();
    expect(simplified.children![0].children![0].collapsed).toBe(true);
    expect(simplified.children![0].children![0].children![0].collapsed).toBe(true);
  });

  it("handles empty children gracefully", () => {
    const root: DecisionTreeNode = { id: "root", name: "root" };
    const simplified = simplifyTree(root);
    expect(simplified.children).toBeUndefined();
  });

  it("preserves best path (lowest score) after pruning", () => {
    const root: DecisionTreeNode = {
      id: "root",
      name: "root",
      children: Array.from({ length: 6 }, (_, i) =>
        makeMoveNode(`m${i}`, 10 - i)
      )
    };
    const simplified = simplifyTree(root, { maxChildrenPerNode: 3, initialDepth: 5 });
    expect(simplified.children![0].score).toBe(5);
    expect(simplified.children![1].score).toBe(6);
    expect(simplified.children![2].score).toBe(7);
  });
});

describe("collapsed markers after simplify", () => {
  it("marks deep nodes as collapsed for ECharts", () => {
    const root: DecisionTreeNode = {
      id: "root",
      name: "root",
      children: [
        makeMoveNode("m1", 1, [
          makePositionNode("p1", [
            makeMoveNode("m2", 1, [
              makePositionNode("p2", [
                makeMoveNode("m3", 1, [
                  makePositionNode("p3", [
                    makeMoveNode("m4", 1)
                  ])
                ])
              ])
            ])
          ])
        ])
      ]
    };
    const simplified = simplifyTree(root, { maxChildrenPerNode: 5, initialDepth: 3 });
    const m1 = simplified.children![0];
    const p1 = m1.children![0];
    const m2 = p1.children![0];
    const p2 = m2.children![0];
    expect(m1.collapsed).toBeUndefined();
    expect(p1.collapsed).toBeUndefined();
    expect(m2.collapsed).toBeUndefined();
    expect(p2.collapsed).toBe(true);
  });
});
