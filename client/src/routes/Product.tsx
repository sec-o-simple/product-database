import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import DataGrid from '@/components/forms/DataGrid'
import ListItem from '@/components/forms/ListItem'
import PageContent from '@/components/forms/PageContent'
import AddVersion from '@/components/layout/product/AddVersion'
import { BreadcrumbItem, Chip } from '@heroui/react'
import { useNavigate, useParams } from 'react-router-dom'

export default function Product({
  hideBreadcrumbs = false,
}: {
  hideBreadcrumbs?: boolean
}) {
  const { productId } = useParams()
  const navigate = useNavigate()

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
    <PageContent>
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
          <BreadcrumbItem href={`/vendors/${vendor?.id}`}>
            {vendor?.name}
          </BreadcrumbItem>
          <BreadcrumbItem isDisabled>Products</BreadcrumbItem>
          <BreadcrumbItem>{product?.name}</BreadcrumbItem>
        </Breadcrumbs>
      )}

      <DataGrid
        title={`Versions (${product.versions?.length})`}
        addButton={<AddVersion productBranchId={product.id} />}
      >
        {product.versions.length === 0
          ? null
          : product.versions.map((version) => (
              <ListItem
                key={version.id}
                onClick={() =>
                  navigate(`/products/${productId}/versions/${version.id}`)
                }
                title={
                  <div className="flex gap-2 items-center">
                    {/* {version.id === 1 && <LatestChip />} */}

                    <p>{version.name}</p>
                  </div>
                }
                description={'No description'}
                chips={
                  version.source_relationships &&
                  version.source_relationships.length !== 0 && (
                    <div className="flex flex-row gap-2">
                      {version.source_relationships.map((relationship) => (
                        <Chip className="rounded-md" size="sm" variant="flat">
                          {relationship.category}:{' '}
                          {relationship.target_branch_name}
                        </Chip>
                      ))}
                    </div>
                  )
                }
              />
            ))}
      </DataGrid>
    </PageContent>
  )
}
