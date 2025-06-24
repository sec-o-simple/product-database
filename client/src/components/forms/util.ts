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
