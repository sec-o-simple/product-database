import ListItem from '@/components/forms/ListItem'
import Pagination from '@/components/table/Pagination'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Chip, Divider, Input } from '@heroui/react'
import { Tab, Tabs } from '@heroui/tabs'
import { useNavigate } from 'react-router-dom'

export default function Vendors() {
  const navigate = useNavigate()

  return (
    <div className="flex grow flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between">
        <Tabs
          selectedKey="vendors"
          className="w-full"
          color="primary"
          variant="light"
        >
          <Tab key="vendors" title="Vendors" href="/vendors" />
          <Tab key="products" title="Products" href="/products" />
        </Tabs>

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
          variant="bordered"
          type="search"
        />
      </div>

      <Divider />

      <div className="w-full flex gap-2 flex-col">
        <ListItem
          onClick={() => navigate('/vendors/1')}
          title="Microsoft"
          description="This product is the latest release of this series."
          chips={
            <div className="flex gap-2">
              <Chip color="primary" radius="sm" variant="flat">
                Microsoft
              </Chip>
            </div>
          }
        />

        <ListItem
          onClick={() => navigate('/vendors/1')}
          title="Microsoft"
          description="This product is the latest release of this series."
          chips={
            <div className="flex gap-2">
              <Chip color="primary" radius="sm" variant="flat">
                Apple
              </Chip>
            </div>
          }
        />

        <Pagination />
      </div>
    </div>
  )
}
