import { describe, it, expect } from 'vitest'
import {
  getItemChildIds,
  TreeViewBaseItemWithParents,
} from '../src/components/forms/util'

describe('util functions', () => {
  describe('getItemChildIds', () => {
    it('should return empty array for item without children', () => {
      const item: TreeViewBaseItemWithParents = {
        id: 'item1',
        label: 'Item 1',
      }

      const result = getItemChildIds(item)
      expect(result).toEqual([])
    })

    it('should return child ids for item with children', () => {
      const item: TreeViewBaseItemWithParents = {
        id: 'parent',
        label: 'Parent',
        children: [
          {
            id: 'child1',
            label: 'Child 1',
          },
          {
            id: 'child2',
            label: 'Child 2',
          },
        ],
      }

      const result = getItemChildIds(item)
      expect(result).toEqual(['child1', 'child2'])
    })

    it('should return nested child ids recursively', () => {
      const item: TreeViewBaseItemWithParents = {
        id: 'root',
        label: 'Root',
        children: [
          {
            id: 'parent1',
            label: 'Parent 1',
            children: [
              {
                id: 'child1',
                label: 'Child 1',
              },
              {
                id: 'child2',
                label: 'Child 2',
              },
            ],
          },
          {
            id: 'parent2',
            label: 'Parent 2',
            children: [
              {
                id: 'child3',
                label: 'Child 3',
                children: [
                  {
                    id: 'grandchild1',
                    label: 'Grandchild 1',
                  },
                ],
              },
            ],
          },
        ],
      }

      const result = getItemChildIds(item)
      expect(result).toEqual([
        'parent1',
        'child1',
        'child2',
        'parent2',
        'child3',
        'grandchild1',
      ])
    })

    it('should handle empty children array', () => {
      const item: TreeViewBaseItemWithParents = {
        id: 'item1',
        label: 'Item 1',
        children: [],
      }

      const result = getItemChildIds(item)
      expect(result).toEqual([])
    })
  })
})
