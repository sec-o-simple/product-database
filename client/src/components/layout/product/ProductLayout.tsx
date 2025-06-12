import client from '@/client'
import PageContainer from '@/components/forms/PageContainer'
import Sidebar from '@/components/forms/Sidebar'
import {
  HelperTypeProps,
  idHelperTypes,
} from '@/routes/IdentificationHelper/IdentificationOverview'
import { faAdd, faFileExport } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from '@heroui/react'
import { Outlet, useParams } from 'react-router-dom'
import { TopBar } from '../TopBarLayout'
import { Attribute } from '../vendor/VendorLayout'
import AddVersion from './AddVersion'

export function AddIdHelper({
  onAdd,
  isIconOnly = false,
  isDisabled,
}: {
  onAdd?: (helper: HelperTypeProps) => void
  isIconOnly?: boolean
  isDisabled?: (helper: HelperTypeProps) => boolean
}) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          color="primary"
          isIconOnly={isIconOnly}
          variant="flat"
          startContent={<FontAwesomeIcon icon={faAdd} />}
        >
          {!isIconOnly && 'Add ID Helper'}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        closeOnSelect={false}
        disabledKeys={idHelperTypes
          .filter((type) => isDisabled?.(type))
          .map((type) => String(type.id))}
      >
        <DropdownSection title="Helper Types">
          {idHelperTypes.map((type) => (
            <DropdownItem key={type.id} onPress={() => onAdd?.(type)}>
              {type.label}
            </DropdownItem>
          ))}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}

export default function ProductLayout() {
  const { productId } = useParams()

  const { data: product } = client.useQuery('get', `/api/v1/products/{id}`, {
    params: {
      path: {
        id: productId || '',
      },
    },
  })

  const { data: vendor } = client.useQuery('get', `/api/v1/vendors/{id}`, {
    params: {
      path: {
        id: product?.vendor_id || '',
      },
    },
  })

  if (!product) {
    return null
  }

  return (
    <PageContainer>
      <TopBar
        title={`Product: ${product.name}`}
        historyLink={`/products/${product.id}/history`}
      >
        <div className="flex flex-row gap-4">
          <Button
            color="primary"
            variant="light"
            disabled
            startContent={<FontAwesomeIcon icon={faFileExport} />}
          >
            Export
          </Button>

          <AddVersion productBranchId={product.id} />
        </div>
      </TopBar>

      <div className="flex flex-row h-full flex-grow">
        <Sidebar
          attributes={[
            <Attribute label="Name" value={product.name} />,
            <Attribute
              label="Description"
              value={product.description || '-/-'}
            />,
            <Attribute
              label="Vendor"
              value={vendor?.name || '-/-'}
              href={`/vendors/${product.vendor_id}`}
            />,
          ]}
        />
        <div className="p-4 w-full">
          <Outlet />
        </div>
      </div>
    </PageContainer>
  )
}
