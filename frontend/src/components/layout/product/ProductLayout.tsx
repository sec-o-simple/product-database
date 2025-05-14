import { IdentificationGroup } from '@/routes/IdentificationHelper'
import {
  faAdd,
  faArrowLeft,
  faFileExport,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from '@heroui/react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import IconButton from '../../forms/IconButton'
import { UserAvatar } from '../TopBarLayout'
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
        <Button color="primary" isIconOnly={isIconOnly} variant="flat">
          <FontAwesomeIcon icon={faAdd} />
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
  const { vendorId } = useParams()
  const navigate = useNavigate()

  const product = {
    id: 1,
    name: 'Product 1',
    description: 'Product 1 description',
    vendorId: vendorId,
  }

  return (
    <div className="flex h-screen flex-col bg-[#F9FAFB]">
      <div className="flex w-full items-center justify-between gap-8 border-b px-6 py-4 bg-white">
        <span className="flex items-center gap-2 text-2xl font-bold">
          <IconButton
            icon={faArrowLeft}
            color="primary"
            variant="light"
            isIconOnly={true}
            onPress={() => navigate(-1)}
          />
          <p>Product: {product?.id}</p>
        </span>

        <div className="flex flex-row gap-4">
          <Button color="primary" variant="light" disabled>
            <FontAwesomeIcon icon={faFileExport} />
            Export
          </Button>

          <AddVersion />

          <UserAvatar />
        </div>
      </div>

      <div className="flex flex-row h-full">
        <div className="flex w-1/3 max-w-64 flex-col gap-4 border-r bg-white p-4">
          <Attribute label="Name" value={product?.name} />

          <Attribute label="Description" value={product?.description} />

          <p className="text-md font-bold mt-4">Identification Helpers</p>
          {idHelperTypes.map((type) => (
            <IdentificationGroup
              key={type.id}
              label={type.label}
              description={type.description}
              items={[]}
            />
          ))}
        </div>
        <div className="p-4 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
