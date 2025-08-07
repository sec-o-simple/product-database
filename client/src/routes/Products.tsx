import client from '@/client'
import DataGrid from '@/components/forms/DataGrid'
import IconButton from '@/components/forms/IconButton'
import LatestChip from '@/components/forms/Latest'
import ListItem from '@/components/forms/ListItem'
import useRefetchQuery from '@/utils/useRefetchQuery'
import useRouter from '@/utils/useRouter'
import { faEdit, faFileExport } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { addToast, Chip, Divider } from '@heroui/react'
import { Tab, Tabs } from '@heroui/tabs'
import { createContext, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeleteProduct } from './Product'

export function useProductListQuery() {
  const request = client.useQuery('get', '/api/v1/products')

  useRefetchQuery(request)
  return request
}

export function useVendorProductListQuery(vendorId: string) {
  const request = client.useQuery('get', '/api/v1/vendors/{id}/products', {
    params: {
      path: {
        id: vendorId || '',
      },
    },
  })

  useRefetchQuery(request)
  return request
}

export function DashboardTabs({
  selectedKey,
  endContent,
}: {
  selectedKey: string
  endContent?: React.ReactNode
}) {
  const { t } = useTranslation()

  return (
    <div className="flex w-full flex-col items-center justify-between">
      <div className="mb-2 flex w-full items-center justify-between">
        <Tabs
          selectedKey={selectedKey}
          className="w-full"
          color="primary"
          variant="light"
        >
          <Tab
            key="vendors"
            title={t('vendor.label', { count: 2 })}
            href="/vendors"
          />
          <Tab
            key="products"
            title={t('product.label', { count: 2 })}
            href="/products"
          />
          <Tab key="tree" title={t('treeView.label')} href="/tree" />
        </Tabs>

        {endContent}
      </div>
      <Divider />
    </div>
  )
}

export function ProductItem({
  product,
}: {
  product: {
    id: string
    name: string
    description?: string
    vendor_id?: string
    type?: string
    latest_versions?: {
      description?: string
      full_name: string
      id: string
      is_latest: boolean
      name: string
      predecessor_id?: string | null
      product_id?: string
      released_at?: string | null
    }[]
  }
}) {
  const { navigateToModal, navigate } = useRouter()
  const { t } = useTranslation()

  const handleOnActionClick = (href: string) => {
    navigateToModal(href, `/vendors/${product.vendor_id}`)
  }

  return (
    <ListItem
      key={product.id}
      id={product.id}
      onClick={() => navigate(`/products/${product.id}`)}
      title={
        <div className="flex items-center gap-2">
          {product.latest_versions && <LatestChip />}
          <p>{product.name}</p>
        </div>
      }
      actions={
        <div className="flex flex-row gap-1">
          <IconButton
            icon={faEdit}
            onPress={() => handleOnActionClick(`/products/${product.id}/edit`)}
          />

          <DeleteProduct product={product} isIconButton />
        </div>
      }
      chips={
        product.type && (
          <Chip radius="md" size="sm">
            {product.type}
          </Chip>
        )
      }
      description={product.description || t('common.noDescription')}
    />
  )
}

export const SelectableContext = createContext<{
  selectable: boolean
  toggleSelectable: () => void
  selected: string[]
  setSelected: React.Dispatch<React.SetStateAction<string[]>>
}>({
  selectable: false,
  toggleSelectable: () => {},
  selected: [],
  setSelected: () => {},
})

function useExportProductTree() {
  const { t } = useTranslation()

  return client.useMutation('post', '/api/v1/products/export', {
    onSuccess: (response) => {
      const blob = new Blob([JSON.stringify(response, null, 2)], {
        type: 'application/json',
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `product_tree_export_${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    },
    onError: (error) => {
      addToast({
        title: t('export.error.title'),
        description: error?.title || t('export.error.text'),
        color: 'danger',
      })
    },
  })
}

export default function Products() {
  const { data: products } = client.useQuery('get', '/api/v1/products')
  const { t } = useTranslation()
  const [selected, setSelected] = useState<string[]>([])
  const [selectable, setSelectable] = useState<boolean>(false)
  const toggleSelectable = () => {
    setSelectable(!selectable)
    setSelected([])
  }

  const exportMutation = useExportProductTree()

  const onExportClick = useCallback(() => {
    exportMutation.mutate({
      body: selected.length > 0 ? selected : [],
    })
  }, [exportMutation, selected])

  return (
    <div className="flex grow flex-col items-center gap-4">
      <DashboardTabs selectedKey="products" />

      <div className="flex w-full items-center justify-end gap-2">
        {selectable ? (
          <>
            <Button variant="light" color="danger" onPress={toggleSelectable}>
              {t('export.stopSelection')}
            </Button>

            <Button
              color="primary"
              onPress={onExportClick}
              isDisabled={selected.length === 0}
            >
              <FontAwesomeIcon icon={faFileExport} />
              {t('export.exportSelected', { count: selected.length })}
            </Button>
          </>
        ) : (
          <Button variant="light" color="primary" onPress={toggleSelectable}>
            {t('export.label')}
          </Button>
        )}
      </div>

      <SelectableContext.Provider
        value={{
          selectable,
          toggleSelectable: () => {
            setSelectable(!selectable)
            setSelected([])
          },
          selected,
          setSelected,
        }}
      >
        <DataGrid>
          {products?.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </DataGrid>
      </SelectableContext.Provider>

      {/* <Pagination /> */}
    </div>
  )
}
