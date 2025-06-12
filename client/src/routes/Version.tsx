import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import AddRelationship from '@/components/layout/product/AddRelationship'
import { BreadcrumbItem } from '@heroui/react'
import { useParams } from 'react-router-dom'
import { EmptyState } from './Vendor'

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
    `/api/v1/product-versions/{id}`,
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
        <EmptyState add={<AddRelationship />} />
        {/* {!version.source_relationships || version.source_relationships.length === 0 ? */}
        {/* <EmptyState add={<AddRelationship />} /> : null} */}

        {/* {version.source_relationships?.map((relationship) => (
          <ListGroup title={relationship.category} key={`${relationship.category}-${relationship.id}`}>
            <ListItem
              classNames={{
                base: 'border-default-200 border-b-0 rounded-none',
              }}
              title={
                <div className="flex gap-2 items-center">
                  {version.id === 1 && <LatestChip />}

                  <p>{relationship.target_branch_name}</p>
                </div>
              }
              description={'No description'}
            />
          </ListGroup>
        ))} */}
      </div>
    </div>
  )
}
