import DataGrid, { FilterButton } from '@/components/forms/DataGrid'
import ListItem from '@/components/forms/ListItem'
import AddVendor from '@/components/layout/vendor/AddVendor'
import { fakeVendors } from '@/components/layout/vendor/VendorLayout'
import {
  faEdit,
  faSearch,
  faSortAlphaAsc,
  faSortAmountAsc,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Chip, cn, Input, Listbox, ListboxItem } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { DashboardTabs } from './Products'

export function EditPopover({
  onEdit,
  onDelete,
}: {
  onEdit?: () => void
  onDelete?: () => void
}) {
  const iconClasses = 'text-default-500 pointer-events-none flex-shrink-0'

  return (
    <Listbox
      aria-label="Listbox menu with icons"
      className="p-0 gap-0 bg-content1 max-w-[300px] overflow-visible shadow-small rounded-medium"
      itemClasses={{
        base: 'px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-8 data-[hover=true]:bg-default-100/80',
      }}
      variant="flat"
    >
      <ListboxItem
        key="new"
        onClick={onEdit}
        startContent={<FontAwesomeIcon className={iconClasses} icon={faEdit} />}
      >
        Edit
      </ListboxItem>
      <ListboxItem
        key="delete"
        color="danger"
        className="text-danger"
        onClick={onDelete}
        startContent={
          <FontAwesomeIcon
            className={cn(iconClasses, 'text-danger')}
            icon={faTrash}
          />
        }
      >
        Delete
      </ListboxItem>
    </Listbox>
  )
}

export default function Vendors() {
  const navigate = useNavigate()

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
            <FilterButton title="Products" icon={faSortAmountAsc} />
            <FilterButton title="Name" icon={faSortAlphaAsc} />
          </div>
          <AddVendor />
        </div>

        <DataGrid addButton={<AddVendor />}>
          {fakeVendors.map((vendor) => (
            <ListItem
              key={vendor.id}
              onClick={() => navigate(`/vendors/${vendor.id}`)}
              title={vendor.name}
              description="This product is the latest release of this series."
              menu={<EditPopover />}
              chips={
                vendor.products && (
                  <Chip variant="flat" color="primary" className="rounded-md">
                    Products: {vendor.products?.length}
                  </Chip>
                )
              }
            />
          ))}
        </DataGrid>
      </div>
    </div>
  )
}
