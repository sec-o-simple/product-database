import client from '@/client'
import DataGrid, { FilterButton } from '@/components/forms/DataGrid'
import IconButton from '@/components/forms/IconButton'
import ListItem from '@/components/forms/ListItem'
import CreateEditVendor, {
  CreateVendorButton,
} from '@/components/layout/vendor/CreateEditVendor'
import useRefetchQuery from '@/utils/useRefetchQuery'
import useRouter from '@/utils/useRouter'
import {
  faEdit,
  faSearch,
  faSortAlphaAsc,
  faSortAmountAsc,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Chip, Input } from '@heroui/react'
import { DashboardTabs } from './Products'
import { DeleteVendor } from './Vendor'

export type VendorProps = {
  id?: string
  name: string
  description: string
  product_count?: number
}

export function useVendorListQuery() {
  const request = client.useQuery('get', '/api/v1/vendors')
  useRefetchQuery(request)
  return request
}

export function VendorItem({ vendor }: { vendor: VendorProps }) {
  const { navigate, navigateToModal } = useRouter()

  return (
    <ListItem
      key={vendor.id}
      onClick={() => navigate(`/vendors/${vendor.id}`)}
      title={vendor.name}
      description={vendor.description}
      actions={
        <div className="flex flex-row gap">
          <IconButton
            icon={faEdit}
            onPress={() => navigateToModal(`/vendors/${vendor.id}/edit`)}
          />

          <DeleteVendor vendor={vendor} isIconButton />
        </div>
      }
      chips={
        vendor.product_count !== 0 && (
          <Chip variant="flat" color="primary" className="rounded-md">
            {vendor.product_count} Products
          </Chip>
        )
      }
    />
  )
}

export default function Vendors() {
  const { data: vendors } = useVendorListQuery()

  return (
    <div className="flex grow flex-col items-center gap-4">
      <DashboardTabs
        selectedKey="vendors"
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

      <div className="w-full flex gap-2 flex-col">
        <div className="flex w-full items-center justify-between mb-2 gap-2">
          <div className="flex flex-grow flex-row gap-2">
            <FilterButton title="Name" icon={faSortAlphaAsc} disabled />
            <FilterButton title="Products" icon={faSortAmountAsc} disabled />
          </div>

          <CreateVendorButton />
        </div>

        <DataGrid addButton={<CreateEditVendor />}>
          {vendors?.map((vendor) => (
            <VendorItem key={vendor.id} vendor={vendor} />
          ))}
        </DataGrid>
      </div>
    </div>
  )
}
