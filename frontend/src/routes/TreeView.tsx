import { fakeVendors } from '@/components/layout/vendor/VendorLayout'
import {
  faArrowDown,
  faArrowUp,
  faArrowUpRightFromSquare,
  faBuilding,
  faCodeBranch,
  faSitemap,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Spinner, Tooltip } from '@heroui/react'
import {
  SimpleTreeView as MuiTreeView,
  TreeItem,
  TreeViewBaseItem,
} from '@mui/x-tree-view'
import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Product from './Product'
import { DashboardTabs } from './Products'
import Vendor from './Vendor'
import Version from './Version'

interface SelectedNode {
  type: 'vendor' | 'product' | 'version'
  id: string | null
}

export function HydrateFallback() {
  return <Spinner />
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

  const handleSelectedItemsChange = (_event: any, itemIds: string[] | null) => {
    if (itemIds === null) {
      setSelectedIds([])
      return
    }

    setSelectedIds(
      determineIdsToSet(
        fakeVendors.map((vendor) => ({
          id: String(vendor.id),
          label: vendor.name,
          children: vendor.products?.map((product) => ({
            id: vendor.id + '_' + product.id,
            label: product.name,
            children: product.versions?.map((version) => ({
              id: vendor.id + '_' + product.id + '_' + version.id,
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
  const apiRef = useRef<any>(null)

  const item = useMemo(() => {
    if (!selected) return null

    const [vendorId, productId, versionId] = selected.id?.split('_') || []
    if (!vendorId) return null

    const vendor = fakeVendors.find((v) => v.id === Number(vendorId))
    if (!vendor) return null
    if (selected.type === 'vendor') return vendor
    const product = vendor.products?.find((p) => p.id === Number(productId))
    if (!product) return null
    if (selected.type === 'product') return product
    const version = product.versions?.find((v) => v.id === Number(versionId))
    if (!version) return null
    return version
  }, [selected])

  return (
    <div className="flex grow flex-col items-center gap-4">
      <DashboardTabs selectedKey="tree" />

      <div className="flex w-full gap-4">
        <div className="flex flex-col gap-2 w-1/5">
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              variant="flat"
              color={selected === null ? 'default' : 'primary'}
              className="w-full"
              disabled={selected === null}
              onPress={() => setSelected(null)}
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
                      fakeVendors.forEach((vendor) => {
                        newItems.push(String(vendor.id))
                        vendor.products?.forEach((product) => {
                          newItems.push(vendor.id + '_' + product.id)
                          product.versions?.forEach((version) => {
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

          <div className="bg-white rounded-lg border-1 border-gray-200 p-2">
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
              {fakeVendors.map((vendor) => (
                <TreeItem
                  key={vendor.id}
                  itemId={String(vendor.id)}
                  label={
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faBuilding}
                        className="text-primary"
                      />
                      {vendor.name}
                    </div>
                  }
                  onClick={(event) => {
                    event.stopPropagation()
                    setSelected({
                      type: 'vendor',
                      id: String(vendor.id),
                    })
                  }}
                >
                  {vendor.products?.map((product) => (
                    <TreeItem
                      key={vendor.id + '_' + product.id}
                      itemId={vendor.id + '_' + product.id}
                      label={
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faSitemap}
                            className="text-primary"
                          />
                          {product.name}
                        </div>
                      }
                      onClick={(event) => {
                        event.stopPropagation()

                        setSelected({
                          type: 'product',
                          id: vendor.id + '_' + product.id,
                        })
                      }}
                    >
                      {product.versions?.map((version) => (
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
                              id:
                                vendor.id + '_' + product.id + '_' + version.id,
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
          <div className="w-4/5 bg-white rounded-lg border-1 border-gray-200 p-6 space-y-4">
            <div className="flex w-full justify-between items-center gap-2">
              <p className="font-semibold text-xl">
                <FontAwesomeIcon
                  icon={
                    selected?.type === 'vendor'
                      ? faBuilding
                      : selected?.type === 'product'
                        ? faSitemap
                        : selected?.type === 'version'
                          ? faCodeBranch
                          : faCodeBranch
                  }
                  className="text-primary text-2xl mr-4"
                />
                {item?.name}
              </p>

              <Button
                endContent={<FontAwesomeIcon icon={faArrowUpRightFromSquare} />}
                color="primary"
                variant="light"
                onPress={() => {
                  navigate(`/${selected?.type}s/${item?.id}`)
                }}
                href={`/${selected?.type}/${item?.id}`}
              >
                Jump to Element
              </Button>
            </div>

            <div>
              {selected?.type === 'vendor' && <Vendor hideBreadcrumbs={true} />}
              {selected?.type === 'product' && (
                <Product hideBreadcrumbs={true} />
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
