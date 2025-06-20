import client from '@/client'
import DataGrid from '@/components/forms/DataGrid'
import IconButton from '@/components/forms/IconButton'
import { Input } from '@/components/forms/Input'
import LatestChip from '@/components/forms/Latest'
import ListItem from '@/components/forms/ListItem'
import useRefetchQuery from '@/utils/useRefetchQuery'
import useRouter from '@/utils/useRouter'
import { faEdit, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Chip, Divider } from '@heroui/react'
import { Tab, Tabs } from '@heroui/tabs'
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
  return (
    <div className="flex flex-col w-full items-center justify-between">
      <div className="flex w-full items-center justify-between mb-2">
        <Tabs
          selectedKey={selectedKey}
          className="w-full"
          color="primary"
          variant="light"
        >
          <Tab key="vendors" title="Vendors" href="/vendors" />
          <Tab key="products" title="Products" href="/products" />
          <Tab key="tree" title="Tree-View" href="/tree" />
        </Tabs>

        {endContent}
      </div>
      <Divider />
    </div>
  )
}

export function ProductItem({ product }: { product: any }) {
  const { navigate, location } = useRouter()

  const handleOnActionClick = (href: string) => {
    navigate(href, {
      state: {
        backgroundLocation: location,
      },
    })
  }

  return (
    <ListItem
      key={product.id}
      onClick={() => navigate(`/products/${product.id}`)}
      title={
        <div className="flex gap-2 items-center">
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
      description={product.description}
    />
  )
}

export default function Products() {
  const { data: products } = client.useQuery('get', '/api/v1/products')

  return (
    <div className="flex grow flex-col items-center gap-4">
      <DashboardTabs
        selectedKey="products"
        endContent={
          <Input
            classNames={{
              base: 'max-w-full sm:max-w-[16rem] h-10',
              mainWrapper: 'h-full',
              input: 'text-small',
              inputWrapper:
                'h-full font-normal text-default-500 bg-white rounded-lg',
            }}
            placeholder="Type to search..."
            disabled
            size="sm"
            startContent={<FontAwesomeIcon icon={faSearch} />}
            type="search"
            variant="bordered"
          />
        }
      />

      <DataGrid>
        {products?.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </DataGrid>

      {/* <Pagination /> */}
    </div>
  )
}
