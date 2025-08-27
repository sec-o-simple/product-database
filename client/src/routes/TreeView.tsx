import { ProductProps } from '@/components/layout/product/CreateEditProduct'
import { VersionProps } from '@/components/layout/version/CreateEditVersion'
import {
  faArrowDown,
  faArrowUp,
  faArrowUpRightFromSquare,
  faClose,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Spinner, Tooltip } from '@heroui/react'
import {
  SimpleTreeView as MuiTreeView,
  TreeItem,
  TreeViewBaseItem,
} from '@mui/x-tree-view'
import { SyntheticEvent, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Product from './Product'
import { DashboardTabs, useProductListQuery } from './Products'
import Vendor from './Vendor'
import { useVendorListQuery, VendorProps } from './Vendors'
import Version from './Version'

interface SelectedNode {
  type: 'vendor' | 'product' | 'version'
  item: ProductProps | VendorProps | VersionProps
}

export function HydrateFallback() {
  return <Spinner />
}

enum TypeLabels {
  vendor = 'Vendor',
  product = 'Product',
  version = 'Version',
}

function getParentNode(
  items: TreeViewBaseItem[],
  id: string,
): TreeViewBaseItem | undefined {
  for (const item of items) {
    if (item.children) {
      if (item.children.some((child) => child.id === id)) {
        // The current item is the parent of the supplied id
        return item
      } else {
        // Recursively call the function for the children of the current item
        const parentNode = getParentNode(item.children, id)
        if (parentNode) {
          return parentNode
        }
      }
    }
  }

  // No parent found
  return undefined
}

function getAllParentIds(items: TreeViewBaseItem[], id: string) {
  const parentIds: string[] = []
  let parent = getParentNode(items, id)
  while (parent) {
    parentIds.push(parent.id)
    parent = getParentNode(items, parent.id)
  }
  return parentIds
}

function getSelectedIdsAndChildrenIds(
  items: TreeViewBaseItem[],
  selectedIds: string[],
) {
  const selectedIdIncludingChildrenIds = new Set([...selectedIds])

  for (const item of items) {
    if (selectedIds.includes(item.id)) {
      // Add the current item's id to the result array
      selectedIdIncludingChildrenIds.add(item.id)

      // Recursively call the function for the children of the current item
      if (item.children) {
        const childrenIds = item.children.map((child) => child.id)
        const childrenSelectedIds = getSelectedIdsAndChildrenIds(
          item.children,
          childrenIds,
        )
        childrenSelectedIds.forEach((selectedId) =>
          selectedIdIncludingChildrenIds.add(selectedId),
        )
      }
    } else if (item.children) {
      // walk the children to see if selections lay in there also
      const childrenSelectedIds = getSelectedIdsAndChildrenIds(
        item.children,
        selectedIds,
      )
      childrenSelectedIds.forEach((selectedId) =>
        selectedIdIncludingChildrenIds.add(selectedId),
      )
    }
  }

  return [...Array.from(selectedIdIncludingChildrenIds)]
}

function determineIdsToSet(
  items: TreeViewBaseItem[],
  newIds: string[],
  currentIds: string[],
) {
  const isDeselectingNode = currentIds.length > newIds.length
  if (isDeselectingNode) {
    const removed = currentIds.filter((id) => !newIds.includes(id))[0]
    const parentIdsToRemove = getAllParentIds(items, removed)
    const childIdsToRemove = getSelectedIdsAndChildrenIds(items, [removed])

    const newIdsWithParentsAndChildrenRemoved = newIds.filter(
      (id) => !parentIdsToRemove.includes(id) && !childIdsToRemove.includes(id),
    )

    return newIdsWithParentsAndChildrenRemoved
  }

  const added = newIds.filter((id) => !currentIds.includes(id))[0]
  const idsToSet = getSelectedIdsAndChildrenIds(items, newIds)
  let parent = getParentNode(items, added)
  while (parent) {
    const childIds = parent.children?.map((node) => node.id) ?? []
    const allChildrenSelected = childIds.every((id) => idsToSet.includes(id))
    if (allChildrenSelected) {
      idsToSet.push(parent.id)
      parent = getParentNode(items, parent.id)
    } else {
      break
    }
  }
  return idsToSet
}

export default function TreeView() {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [selected, setSelected] = useState<SelectedNode | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const { data: v } = useVendorListQuery()
  const { data: products } = useProductListQuery()

  const vendors = v?.map((vendor) => ({
    ...vendor,
    products: products
      ?.filter((product) => product.vendor_id === vendor.id)
      .map((product) => ({
        ...product,
        versions: product.versions?.sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }))

  const handleSelectedItemsChange = (
    _event: SyntheticEvent | null,
    itemIds: string[] | null,
  ) => {
    if (itemIds === null) {
      setSelectedIds([])
      return
    }

    if (!vendors) {
      setSelectedIds([])
      return
    }

    setSelectedIds(
      determineIdsToSet(
        vendors?.map((vendor) => ({
          id: String(vendor.id),
          label: vendor.name,
          children: vendor.products?.map((product) => ({
            id: String(product.id),
            label: product.name,
            children: product.versions?.map((version: VersionProps) => ({
              id: String(version.id),
              label: version.name,
            })),
          })),
        })),
        itemIds,
        selectedIds,
      ),
    )
  }

  const navigate = useNavigate()
  const apiRef = useRef(undefined)

  return (
    <div className="flex grow flex-col items-center gap-4">
      <DashboardTabs selectedKey="tree" />

      <div className="flex w-full gap-4">
        <div className="flex min-w-40 flex-col gap-2">
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              variant="flat"
              color={selected === null ? 'default' : 'primary'}
              className="w-full"
              disabled={selected === null}
              onPress={() => setSelectedIds([])}
            >
              Clear Selection
            </Button>
            <Tooltip content="Collapse All" placement="bottom">
              <Button
                isIconOnly
                color="primary"
                variant="flat"
                onPress={() => setExpandedItems([])}
              >
                <FontAwesomeIcon icon={faArrowUp} className="text-primary" />
              </Button>
            </Tooltip>

            <Tooltip content="Expand All" placement="bottom">
              <Button
                isIconOnly
                color="primary"
                variant="flat"
                onPress={() => {
                  setExpandedItems((prev) => {
                    const newItems = [...prev]
                    if (newItems.length === 0) {
                      vendors?.forEach((vendor) => {
                        newItems.push(String(vendor.id))
                        vendor.products?.forEach((product) => {
                          newItems.push(vendor.id + '_' + product.id)
                          product.versions?.forEach((version: VersionProps) => {
                            newItems.push(
                              vendor.id + '_' + product.id + '_' + version.id,
                            )
                          })
                        })
                      })
                    } else {
                      newItems.length = 0
                    }
                    return newItems
                  })
                }}
              >
                <FontAwesomeIcon icon={faArrowDown} className="text-primary" />
              </Button>
            </Tooltip>
          </div>

          <div className="rounded-lg border-1 border-slate-200 bg-white p-2">
            <MuiTreeView
              checkboxSelection
              apiRef={apiRef}
              multiSelect
              selectedItems={selectedIds}
              expandedItems={expandedItems}
              onExpandedItemsChange={(_, expandedItems) =>
                setExpandedItems(expandedItems)
              }
              onSelectedItemsChange={handleSelectedItemsChange}
            >
              {vendors?.map((vendor) => (
                <TreeItem
                  key={vendor.id}
                  itemId={String(vendor.id)}
                  label={vendor.name}
                  onClick={(event) => {
                    event.stopPropagation()
                    setSelected({
                      type: 'vendor',
                      item: vendor,
                    })
                  }}
                >
                  {vendor.products?.map((product) => (
                    <TreeItem
                      key={vendor.id + '_' + product.id}
                      itemId={vendor.id + '_' + product.id}
                      label={product.name}
                      onClick={(event) => {
                        event.stopPropagation()

                        setSelected({
                          type: 'product',
                          item: product,
                        })
                      }}
                    >
                      {product.versions?.map((version: VersionProps) => (
                        <TreeItem
                          key={vendor.id + '_' + product.id + '_' + version.id}
                          itemId={
                            vendor.id + '_' + product.id + '_' + version.id
                          }
                          label={version.name}
                          onClick={(event) => {
                            event.stopPropagation()

                            setSelected({
                              type: 'version',
                              item: version,
                            })
                          }}
                        />
                      ))}
                    </TreeItem>
                  ))}
                </TreeItem>
              ))}
            </MuiTreeView>
          </div>
        </div>

        {selected && (
          <div className="w-4/5 space-y-4 rounded-lg border-1 border-slate-200 bg-white p-6">
            <div className="flex w-full items-center justify-between gap-2">
              <p className="text-xl font-semibold">
                {TypeLabels[selected?.type] || 'Unknown Type'}
                {': '}
                {selected?.item.name}
              </p>

              <div className="flex items-center gap-1">
                <Button
                  endContent={
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                  }
                  color="primary"
                  variant="light"
                  onPress={() => {
                    navigate(`/${selected?.type}s/${selected?.item.id}`)
                  }}
                  href={`/${selected?.type}/${selected?.item.id}`}
                >
                  Jump to Element
                </Button>

                <Button
                  color="primary"
                  variant="light"
                  isIconOnly
                  onPress={() => setSelected(null)}
                >
                  <FontAwesomeIcon icon={faClose} size="lg" />
                </Button>
              </div>
            </div>

            <div>
              {selected?.type === 'vendor' && (
                <Vendor
                  vendorId={selected.item.id?.toString() || ''}
                  hideBreadcrumbs={true}
                />
              )}
              {selected?.type === 'product' && (
                <Product
                  productId={selected.item.id?.toString() || ''}
                  hideBreadcrumbs={true}
                />
              )}
              {selected?.type === 'version' && (
                <Version hideBreadcrumbs={true} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
