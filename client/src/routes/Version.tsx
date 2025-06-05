import Breadcrumbs from '@/components/forms/Breadcrumbs'
import { Titlebar } from '@/components/forms/DataGrid'
import LatestChip from '@/components/forms/Latest'
import ListItem, { ListGroup } from '@/components/forms/ListItem'
import AddVersion from '@/components/layout/product/AddVersion'
import { fakeVendors } from '@/components/layout/vendor/VendorLayout'
import { getProductVersionById } from '@/components/layout/version/VersionLayout'
import Pagination from '@/components/table/Pagination'
import { BreadcrumbItem, Chip } from '@heroui/react'
import { useParams } from 'react-router-dom'

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
      {
        label: 'Filename',
        type: 'text',
        items: [
          {
            id: 1,
            fields: [
              { label: 'Hash Algorithm', type: 'text' },
              { label: 'Hash Value', type: 'text' },
            ],
          },
        ],
      },
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

export default function Version({
  hideBreadcrumbs = false,
}: {
  hideBreadcrumbs?: boolean
}) {
  const { productId, versionId } = useParams()
  // find the correct product by id
  const { product, version } = getProductVersionById(
    productId || '',
    versionId || '',
  )

  const vendor = fakeVendors.find((vendor) =>
    vendor.products?.some((product) => String(product.id) === productId),
  )

  return (
    <div className="flex grow flex-col w-full gap-4 p-2">
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
          <BreadcrumbItem>{vendor?.name}</BreadcrumbItem>
          <BreadcrumbItem href={`/vendors/${vendor.id}`}>
            Products
          </BreadcrumbItem>
          <BreadcrumbItem>{product?.name}</BreadcrumbItem>
          <BreadcrumbItem href={`/products/${product?.id}/versions`}>
            Versions
          </BreadcrumbItem>
          <BreadcrumbItem>{version?.name}</BreadcrumbItem>
        </Breadcrumbs>
      )}
      <div className="flex w-full flex-col items-center gap-4">
        <Titlebar title="Relationships" />

        <ListGroup title="Installed On">
          {product?.versions?.map((version) => (
            <ListItem
              key={version.id}
              classNames={{
                base: 'border-default-200 border-b-0 rounded-none',
              }}
              title={
                <div className="flex gap-2 items-center">
                  {version.id === 1 && <LatestChip />}

                  <p>{version.name}</p>
                </div>
              }
              description={version.description}
            />
          ))}

          <Pagination
            classNames={{
              base: 'rounded-t-none',
            }}
          />
        </ListGroup>

        <ListGroup title="Component Of">
          {product?.versions?.map((version) => (
            <ListItem
              key={version.id}
              classNames={{
                base: 'border-default-200 border-b-0 rounded-none',
              }}
              title={
                <div className="flex gap-2 items-center">
                  {version.id === 1 && <LatestChip />}

                  <p>{version.name}</p>
                </div>
              }
              description={version.description}
              chips={
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Chip variant="flat" className="rounded-md">
                      Version: 1.2.0
                    </Chip>
                    <Chip variant="flat" className="rounded-md">
                      Version: 1.2.1
                    </Chip>
                  </div>

                  <AddVersion variant="light" size="sm" />
                </div>
              }
            />
          ))}

          <Pagination
            classNames={{
              base: 'rounded-t-none',
            }}
          />
        </ListGroup>
      </div>
    </div>
  )
}
