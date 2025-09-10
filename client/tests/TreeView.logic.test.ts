import { describe, it, expect } from 'vitest';
import {
  getParentNode,
  getAllParentIds,
  getSelectedIdsAndChildrenIds,
  determineIdsToSet,
} from '../src/routes/TreeView';

describe('TreeView logic utilities', () => {
  const tree = [
    {
      id: '1',
      label: 'Vendor 1',
      children: [
        {
          id: '2',
          label: 'Product 1',
          children: [
            { id: '3', label: 'Version 1' },
            { id: '4', label: 'Version 2' },
          ],
        },
      ],
    },
  ];

  it('getParentNode finds parent', () => {
    expect(getParentNode(tree, '2')?.id).toBe('1');
    expect(getParentNode(tree, '3')?.id).toBe('2');
    expect(getParentNode(tree, '1')).toBeUndefined();
  });

  it('getAllParentIds returns all parent ids', () => {
    expect(getAllParentIds(tree, '3')).toEqual(['2', '1']);
    expect(getAllParentIds(tree, '1')).toEqual([]);
  });

  it('getSelectedIdsAndChildrenIds returns selected ids including children', () => {
  expect(getSelectedIdsAndChildrenIds(tree, ['1'])).toEqual(['1', '2', '3', '4']);
  expect(getSelectedIdsAndChildrenIds(tree, ['2'])).toEqual(['2', '3', '4']);
  expect(getSelectedIdsAndChildrenIds(tree, ['3'])).toEqual(['3']);
  });

  it('determineIdsToSet selects/deselects nodes correctly', () => {
    // Select node 2
  expect(determineIdsToSet(tree, ['2'], [])).toEqual(['2', '3', '4', '1']);
    // Deselect node 2
    expect(determineIdsToSet(tree, [], ['2', '3', '4'])).toEqual([]);
  });
});
