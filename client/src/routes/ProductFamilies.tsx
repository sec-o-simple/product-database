import { DashboardTabs } from '@/components/DashboardTabs'
import DataGrid from '@/components/forms/DataGrid'
import IconButton from '@/components/forms/IconButton'
import ListItem from '@/components/forms/ListItem'
import { CreateProductGroupButton } from '@/components/layout/productFamily/CreateEditProductFamily'
import useRouter from '@/utils/useRouter'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

export interface RawProductFamily {
  id: string
  name: string
  parent: string | null
}

export interface ProductFamilyProps {
  id: string
  name: string
  parent: ProductFamilyProps | null
}

const data = {
  data: [
    {
      id: '1',
      name: 'Hardware',
      parent: null,
    },
    {
      id: '2',
      name: 'IPhone',
      parent: '1',
    },
    {
      id: '3',
      name: 'MacBook',
      parent: '1',
    },
    {
      id: '4',
      name: 'Software',
      parent: null,
    },
    {
      id: '5',
      name: 'Operating System',
      parent: '4',
    },
    {
      id: '6',
      name: 'Pro',
      parent: '3',
    },
  ] as RawProductFamily[],
}

function mapWithParentObjects(items: RawProductFamily[]): ProductFamilyProps[] {
  const byId = new Map<string, ProductFamilyProps>()

  // Zuerst leere Objekte erstellen, ohne parents
  items.forEach((item) => {
    byId.set(item.id, { ...item, parent: null })
  })

  // Danach parent-Zeiger korrekt setzen
  items.forEach((item) => {
    const current = byId.get(item.id)!
    if (item.parent) {
      current.parent = byId.get(item.parent) || null
    }
  })

  return Array.from(byId.values())
}

function sortProductFamiliesTree(
  families: ProductFamilyProps[],
): ProductFamilyProps[] {
  const result: ProductFamilyProps[] = []

  // Map zum schnellen Zugriff nach ID
  const byId = new Map<string, ProductFamilyProps>()
  families.forEach((f) => byId.set(f.id, f))

  // Liste der Kinder pro Parent-ID
  const childrenMap = new Map<string | null, ProductFamilyProps[]>()
  families.forEach((f) => {
    const key = f.parent?.id ?? null
    if (!childrenMap.has(key)) childrenMap.set(key, [])
    childrenMap.get(key)!.push(f)
  })

  // Rekursiv sortiert anhängen
  function visit(parentId: string | null) {
    const children = childrenMap.get(parentId) || []
    const sorted = children.sort((a, b) => a.name.localeCompare(b.name))
    for (const child of sorted) {
      result.push(child)
      visit(child.id) // rekursiv Kinder besuchen
    }
  }

  visit(null) // Starte bei Root-Level

  return result
}

export function useProductFamilyListQuery(withParents = false) {
  const request = data

  if (withParents) {
    const productFamiliesWithParents = mapWithParentObjects(request.data)
    return {
      data: sortProductFamiliesTree(productFamiliesWithParents),
    }
  }
  // useRefetchQuery(request)
  return request
}

export function useProductFamilyQuery(id: string) {
  const { data: productFamilies } = data as unknown as {
    data: RawProductFamily[]
  }

  const productFamily = productFamilies.find((pf) => pf.id === id) || null

  return { data: productFamily }
}

export const ProductFamilyChains: React.FC<{ item: ProductFamilyProps }> = ({
  item,
}: {
  item: ProductFamilyProps
}) => {
  const getParentChain = (item: ProductFamilyProps) => {
    const chain = []
    let current = item.parent
    while (current) {
      chain.unshift(current)
      current = current.parent
    }
    return chain
  }

  return (
    <div>
      <div className="flex gap-1" key={item.id}>
        {getParentChain(item).map((parent) => (
          <p key={parent.id} className="text-default-400">
            {parent.name} /
          </p>
        ))}
        <p className="font-bold">{item.name}</p>
      </div>
    </div>
  )
}

export function ProductFamilyItem({
  productFamily,
}: {
  productFamily: ProductFamilyProps
}) {
  const { navigateToModal } = useRouter()

  const handleOnActionClick = (href: string) => {
    navigateToModal(href, `/product-families/${productFamily.id}`)
  }

  return (
    <ListItem
      key={productFamily.id}
      onClick={() =>
        handleOnActionClick(`/product-families/${productFamily.id}/edit`)
      }
      title={<ProductFamilyChains item={productFamily} />}
      actions={
        <div className="flex flex-row gap-1">
          <IconButton
            icon={faEdit}
            onPress={() =>
              handleOnActionClick(`/product-families/${productFamily.id}/edit`)
            }
          />

          {/* <DeleteProduct productGroup={productGroup} isIconButton /> */}
        </div>
      }
    />
  )
}

export default function ProductFamilies() {
  const { data: productFamiliesWithParents } = useProductFamilyListQuery(
    true,
  ) as unknown as { data: ProductFamilyProps[] }

  // Modal, nur Name einstellbar machen und Parent, im Parent dann wieder Parent auswählbar machen
  return (
    <div className="flex grow flex-col items-center gap-4">
      <DashboardTabs selectedKey="productFamilies" />

      <div className="flex w-full flex-col gap-2">
        <div className="mb-2 flex w-full items-center justify-between gap-2">
          <div className="flex grow flex-row gap-2"></div>

          <CreateProductGroupButton />
        </div>

        <DataGrid>
          {productFamiliesWithParents?.map((productFamily) => (
            <ProductFamilyItem
              key={productFamily.id}
              productFamily={productFamily}
            />
          ))}
        </DataGrid>
      </div>
    </div>
  )
}
