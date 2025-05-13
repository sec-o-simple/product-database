import { Input } from '@/components/forms/Input'
import LatestChip from '@/components/forms/Latest'
import ListItem from '@/components/forms/ListItem'
import { fakeVendors } from '@/components/layout/vendor/VendorLayout'
import Pagination from '@/components/table/Pagination'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Divider } from '@heroui/react'
import { Tab, Tabs } from '@heroui/tabs'
import { useNavigate } from 'react-router-dom'

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

export default function Products() {
  const navigate = useNavigate()
  const allProducts = fakeVendors
    .map((vendor) => {
      if (vendor.products) return vendor.products
    })
    .filter((product) => product !== undefined)
    .flat()

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
            size="sm"
            startContent={<FontAwesomeIcon icon={faSearch} />}
            type="search"
            variant="flat"
          />
        }
      />

      {allProducts.map((product) => (
        <ListItem
          key={product.id}
          onClick={() => navigate(`/products/${product.id}`)}
          title={
            <div className="flex gap-2 items-center">
              {product.id === 1 && <LatestChip />}

              <p>{product.name}</p>
            </div>
          }
          description={product.description}
        />
      ))}

      <Pagination />
    </div>
  )
}
