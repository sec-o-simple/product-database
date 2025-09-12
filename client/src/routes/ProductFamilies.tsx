import client from '@/client'
import { DashboardTabs } from '@/components/DashboardTabs'
import ConfirmButton from '@/components/forms/ConfirmButton'
import DataGrid from '@/components/forms/DataGrid'
import IconButton from '@/components/forms/IconButton'
import ListItem from '@/components/forms/ListItem'
import { CreateProductGroupButton } from '@/components/layout/productFamily/CreateEditProductFamily'
import useRefetchQuery from '@/utils/useRefetchQuery'
import useRouter from '@/utils/useRouter'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

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
      <div
        className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 text-sm"
        key={item.id}
      >
        {pathWithoutSelf.map((parent, index) => (
          <span
            key={`${item.id}-${index}`}
            className="break-words text-gray-500 opacity-70"
          >
            {parent} /
          </span>
        ))}
        <span className="font-bold break-words">{item.name}</span>
      </div>
    </div>
  )
}

export function DeleteFamily({
  family,
  isIconButton,
}: {
  family: ProductFamily
  isIconButton?: boolean
}) {
  const mutation = client.useMutation('delete', '/api/v1/product-families/{id}')
  const { navigate } = useRouter()
  const { t } = useTranslation()

  return (
    <ConfirmButton
      isIconOnly={isIconButton}
      variant={isIconButton ? 'light' : 'solid'}
      radius={isIconButton ? 'full' : 'md'}
      color="danger"
      confirmTitle={t('productFamily.delete.title')}
      confirmText={t('productFamily.delete.text', { name: family.name })}
      onConfirm={() => {
        mutation.mutate({
          params: { path: { id: family.id?.toString() ?? '' } },
        })

        navigate('/product-families/', {
          state: {
            shouldRefetch: true,
            message: t('productFamily.delete.success', { name: family.name }),
            type: 'success',
          },
        })
      }}
    >
      <FontAwesomeIcon icon={faTrash} />
      {!isIconButton && t('common.delete')}
    </ConfirmButton>
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

          <DeleteFamily family={productFamily} isIconButton />
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
