import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import ListItem, { ListGroup } from '@/components/forms/ListItem'
import AddRelationship from '@/components/layout/product/AddRelationship'
import { BreadcrumbItem } from '@heroui/react'
import { useParams } from 'react-router-dom'
import { EmptyState } from './Vendor'

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

  const { data: version } = client.useQuery(
    'get',
    `/api/v1/products/{id}/versions/{versionID}`,
    {
      params: {
        path: {
          id: productId || '',
          versionID: versionId || '',
        },
      },
    },
  )

  if (!version) {
    return null
  }

  return (
    <div className="flex grow flex-col w-full gap-4 p-2">
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
          <BreadcrumbItem>{vendor?.name}</BreadcrumbItem>
          <BreadcrumbItem isDisabled>Products</BreadcrumbItem>
          <BreadcrumbItem href={`/products/${product?.id}`}>
            {product?.name}
          </BreadcrumbItem>
          <BreadcrumbItem isDisabled>Versions</BreadcrumbItem>
          <BreadcrumbItem>{version?.name}</BreadcrumbItem>
        </Breadcrumbs>
      )}

      <div className="flex w-full flex-col items-center gap-4">
        {!version.source_relationships ||
        version.source_relationships.length === 0 ? (
          <EmptyState add={<AddRelationship />} />
        ) : null}

        {version.source_relationships?.map((relationship) => (
          <ListGroup
            title={relationship.category}
            key={`${relationship.category}-${relationship.id}`}
          >
            <ListItem
              classNames={{
                base: 'border-default-200 border-b-0 rounded-none',
              }}
              title={
                <div className="flex gap-2 items-center">
                  {/* {version.id === 1 && <LatestChip />} */}

                  <p>{relationship.target_branch_name}</p>
                </div>
              }
              description={'No description'}
            />
          </ListGroup>
        ))}
      </div>
    </div>
  )
}
