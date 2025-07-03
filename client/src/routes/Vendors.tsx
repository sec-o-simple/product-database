import client from '@/client'
import DataGrid from '@/components/forms/DataGrid'
import IconButton from '@/components/forms/IconButton'
import ListItem from '@/components/forms/ListItem'
import { CreateVendorButton } from '@/components/layout/vendor/CreateEditVendor'
import useRefetchQuery from '@/utils/useRefetchQuery'
import useRouter from '@/utils/useRouter'
import { faEdit, faSearch } from '@fortawesome/free-solid-svg-icons'
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

export function VendorItem({
  vendor,
  returnTo,
}: {
  vendor: VendorProps
  returnTo?: string
}) {
  const { navigate, navigateToModal } = useRouter()

  return (
    <ListItem
      key={vendor.id}
      onClick={() => navigate(`/vendors/${vendor.id}`)}
      title={vendor.name}
      description={vendor.description}
      actions={
        <div className="flex flex-row gap-1">
          <IconButton
            icon={faEdit}
            onPress={() =>
              navigateToModal(
                `/vendors/${vendor.id}/edit`,
                returnTo || '/vendors',
              )
            }
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
        // endContent={
        //   <Input
        //     classNames={{
        //       base: 'max-w-full sm:max-w-[16rem] h-10',
        //       mainWrapper: 'h-full',
        //       input: 'text-small',
        //       inputWrapper:
        //         'h-full font-normal text-default-500 bg-white rounded-lg',
        //     }}
        //     placeholder="Type to search..."
        //     disabled
        //     size="sm"
        //     startContent={<FontAwesomeIcon icon={faSearch} />}
        //     type="search"
        //     variant="bordered"
        //   />
        // }
      />

      <div className="flex w-full flex-col gap-2">
        <div className="mb-2 flex w-full items-center justify-between gap-2">
          <div className="flex grow flex-row gap-2">
            {/* <FilterButton title="Name" icon={faSortAlphaAsc} disabled /> */}
            {/* <FilterButton title="Products" icon={faSortAmountAsc} disabled /> */}
          </div>

          <CreateVendorButton />
        </div>

        <DataGrid addButton={<CreateVendorButton />}>
          {(vendors || []).map((vendor) => (
            <VendorItem key={vendor.id} vendor={vendor} returnTo="/vendors" />
          ))}
        </DataGrid>
      </div>
    </div>
  )
}
