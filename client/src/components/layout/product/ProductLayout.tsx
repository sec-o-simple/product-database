import client from '@/client'
import PageContainer from '@/components/forms/PageContainer'
import Sidebar from '@/components/forms/Sidebar'
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

export interface HelperTypeProps {
  id: number
  label: string
  entryTitle: string
  description: string
  fields: { label: string; type: string }[]
}

export const idHelperTypes = [
  {
    id: 1,
    label: 'Hashes',
    entryTitle: 'Hash',
    description:
      'A hash is a fixed-size string of characters generated from data of any size. It is used to verify the integrity of data.',
    fields: [
      { label: 'Algorithm of the hash', type: 'text' },
      { label: 'Hash Value', type: 'text' },
    ],
  },
  {
    id: 2,
    label: 'Models',
    entryTitle: 'Model',
    description:
      'A model is a specific version or variant of a product. It is used to identify the product in the market.',
    fields: [{ label: 'Model Number', type: 'text' }],
  },
  {
    id: 3,
    label: 'SBOM URLs',
    entryTitle: 'SBOM URL',
    description:
      'A Software Bill of Materials (SBOM) URL is a link to a document that lists the components of a software product. It is used to identify the software components and their versions.',
    fields: [{ label: 'SBOM URL', type: 'text' }],
  },
  {
    id: 4,
    label: 'Serial Numbers',
    entryTitle: 'Serial Number',
    description:
      'A serial number is a unique identifier assigned to a product. It is used to track the product throughout its lifecycle.',
    fields: [{ label: 'Serial Number', type: 'text' }],
  },
  {
    id: 5,
    label: 'Stock Keeping Units (SKUs)',
    entryTitle: 'SKU',
    description:
      'A Stock Keeping Unit (SKU) is a unique identifier assigned to a product for inventory management. It is used to track the product in the supply chain.',
    fields: [{ label: 'Stock Keeping Unit', type: 'text' }],
  },
  {
    id: 6,
    label: 'Generic URIs',
    entryTitle: 'URI',
    description:
      'A Uniform Resource Identifier (URI) is a string of characters that identifies a particular resource. It is used to identify the product in the market.',
    fields: [
      { label: 'Namespace of URI', type: 'text' },
      { label: 'URI', type: 'text' },
    ],
  },
] as HelperTypeProps[]

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
