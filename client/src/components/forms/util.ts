import { TreeViewBaseItem } from '@mui/x-tree-view'

export interface TreeViewBaseItemWithParents extends TreeViewBaseItem {
  children?: TreeViewBaseItemWithParents[]
  parents?: string[]
}

export function getItemChildIds(item: TreeViewBaseItemWithParents): string[] {
  const ids: string[] = []
  item.children?.forEach((child) => {
    ids.push(child.id)
    ids.push(...getItemChildIds(child))
  })

  return ids
}

export function getItemParentIds(
  item: TreeViewBaseItemWithParents,
  api: any,
): string[] {
  const ids: string[] = []
  item.parents?.forEach((parentId) => {
    ids.push(parentId)
    const parent = api.getItem(parentId)
    ids.push(...getItemParentIds(parent, api))
  })

  return ids
}
