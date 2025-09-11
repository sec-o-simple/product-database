import client from '@/client'
import { DashboardTabs } from '@/components/DashboardTabs'
import DataGrid from '@/components/forms/DataGrid'
import IconButton from '@/components/forms/IconButton'
import ListItem from '@/components/forms/ListItem'
import { CreateProductGroupButton } from '@/components/layout/productFamily/CreateEditProductFamily'
import useRefetchQuery from '@/utils/useRefetchQuery'
import useRouter from '@/utils/useRouter'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { useMemo } from 'react'

export interface ProductFamily {
  id: string
  name: string
  parent_id?: string
  path: string[]
}

function sortProductFamiliesTree(families: ProductFamily[]): ProductFamily[] {
  const result: ProductFamily[] = []

  const byId = new Map<string, ProductFamily>()
  families.forEach((f) => byId.set(f.id, f))

  const childrenMap = new Map<string | null, ProductFamily[]>()
  families.forEach((f) => {
    const key = f.parent_id ?? null
    if (!childrenMap.has(key)) childrenMap.set(key, [])
    childrenMap.get(key)!.push(f)
  })

  function visit(parentId: string | null) {
    const children = childrenMap.get(parentId) || []
    const sorted = children.sort((a, b) => a.name.localeCompare(b.name))
    for (const child of sorted) {
      result.push(child)
      visit(child.id)
    }
  }

  visit(null)

  return result
}

export function useProductFamilyListQuery() {
  const request = client.useQuery('get', '/api/v1/product-families')

  const sortedData = useMemo(() => {
    if (!request.data) return []
    return sortProductFamiliesTree(request.data)
  }, [request.data])

  useRefetchQuery(request)

  return {
    ...request,
    data: sortedData,
  }
}

export function useProductFamilyQuery(id: string) {
  const request = client.useQuery(
    'get',
    '/api/v1/product-families/{id}',
    {
      params: {
        path: {
          id: id || '',
        },
      },
    },
    {
      enabled: !!id,
    },
  )

  useRefetchQuery(request)
  return request
}

export const ProductFamilyChains: React.FC<{ item: ProductFamily }> = ({
  item,
}: {
  item: ProductFamily
}) => {
  const pathWithoutSelf = item.path.slice(0, -1)

  return (
    <div>
      <div className="flex gap-1" key={item.id}>
        {pathWithoutSelf.map((parent, index) => (
          <p key={`${item.id}-${index}`} className="text-default-400">
            {parent} /
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
  productFamily: ProductFamily
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
        </div>
      }
    />
  )
}

export default function ProductFamilies() {
  const { data: productFamiliesWithParents } = useProductFamilyListQuery()

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
