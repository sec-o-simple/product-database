import ListItem from '@/components/forms/ListItem'
import { fakeVendors } from '@/components/layout/vendor/VendorLayout'
import Pagination from '@/components/table/Pagination'
import { faEdit, faSearch, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Chip, cn, Input, Listbox, ListboxItem } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { DashboardTabs } from './Products'

export function EditPopover({ itemId }: { itemId?: string }) {
  const navigate = useNavigate()
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
        onClick={() => {
          navigate(`/vendors/${itemId}/edit`)
        }}
        startContent={<FontAwesomeIcon className={iconClasses} icon={faEdit} />}
      >
        Edit
      </ListboxItem>
      <ListboxItem
        key="delete"
        color="danger"
        className="text-danger"
        onClick={() => {
          navigate(`/vendors/${itemId}/delete`)
        }}
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
            variant="flat"
          />
        }
      />

      <div className="w-full flex gap-2 flex-col">
        {fakeVendors.map((vendor) => (
          <ListItem
            key={vendor.id}
            onClick={() => navigate(`/vendors/${vendor.id}`)}
            title={vendor.name}
            description="This product is the latest release of this series."
            menu={<EditPopover itemId={String(vendor.id)} />}
            chips={
              vendor.products && (
                <Chip variant="flat" color="primary" className="rounded-md">
                  Products: {vendor.products?.length}
                </Chip>
              )
            }
          />
        ))}

        <Pagination />
      </div>
    </div>
  )
}
