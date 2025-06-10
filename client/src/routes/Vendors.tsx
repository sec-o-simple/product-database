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
import { Button } from '@heroui/button'
import {
  Chip,
  Input,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react'
import { cn } from '@heroui/theme'
import { useNavigate } from 'react-router-dom'
import { DashboardTabs } from './Products'

type EditPopoverProps = {
  onEdit?: () => void
}

type WithDelete = {
  onDelete: () => void
  confirmText: string
  title: string
}

type WithoutDelete = {
  onDelete?: undefined
  confirmText?: undefined
  title?: undefined
}

export function EditPopover(
  props: EditPopoverProps & (WithDelete | WithoutDelete),
) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const iconClasses = 'text-default-500 pointer-events-none flex-shrink-0'

  return (
    <>
      <Listbox
        aria-label="Listbox menu with icons"
        className="p-0 gap-0 bg-content1 max-w-[300px] overflow-visible shadow-small rounded-medium"
        itemClasses={{
          base: 'px-3 first:rounded-t-medium last:rounded-b-medium rounded-none gap-3 h-8 data-[hover=true]:bg-default-100/80',
        }}
        variant="flat"
      >
        {!!props.onEdit ? (
          <ListboxItem
            key="new"
            onClick={props.onEdit}
            startContent={
              <FontAwesomeIcon className={iconClasses} icon={faEdit} />
            }
          >
            Edit
          </ListboxItem>
        ) : null}
        {!!props.onDelete ? (
          <ListboxItem
            key="delete"
            color="danger"
            className="text-danger"
            onClick={() => onOpen()}
            startContent={
              <FontAwesomeIcon
                className={cn(iconClasses, 'text-danger')}
                icon={faTrash}
              />
            }
          >
            Delete
          </ListboxItem>
        ) : null}
      </Listbox>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {props.title ?? 'Confirm'}
              </ModalHeader>
              <ModalBody className="gap-4">
                <p>{props.confirmText}</p>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
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
              menu={
                <EditPopover
                  onEdit={() => {}}
                  onDelete={() => {}}
                  title="Delete Vendor"
                  confirmText="Are you sure you want to delete this vendor? This action cannot be undone."
                />
              }
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
