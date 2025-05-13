import Breadcrumbs from '@/components/forms/Breadcrumbs'
import DataGrid from '@/components/forms/DataGrid'
import LatestChip from '@/components/forms/Latest'
import ListItem from '@/components/forms/ListItem'
import AddVersion from '@/components/layout/product/AddVersion'
import { fakeVendors } from '@/components/layout/vendor/VendorLayout'
import { BreadcrumbItem } from '@heroui/react'
import { useNavigate, useParams } from 'react-router-dom'

export default function Product({
  hideBreadcrumbs = false,
}: {
  hideBreadcrumbs?: boolean
}) {
  const { productId } = useParams()
  const navigate = useNavigate()

  // find the correct product by id
  const product = fakeVendors
    .find((vendor) =>
      vendor.products?.some((product) => String(product.id) === productId),
    )
    ?.products?.find((product) => String(product.id) === productId)

  return (
    <div className="flex grow flex-col w-full gap-4 p-2">
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
          <BreadcrumbItem href="/vendors/1">Products</BreadcrumbItem>
          <BreadcrumbItem>Versions</BreadcrumbItem>
        </Breadcrumbs>
      )}

      <DataGrid
        title={`Versions (${product?.versions?.length ?? 0})`}
        addButton={<AddVersion />}
      >
        {product?.versions?.map((version) => (
          <ListItem
            key={version.id}
            onClick={() =>
              navigate(`/products/${productId}/versions/${version.id}`)
            }
            title={
              <div className="flex gap-2 items-center">
                {version.id === 1 && <LatestChip />}

                <p>{version.name}</p>
              </div>
            }
            description={version.description}
          />
        ))}
      </DataGrid>
    </div>
  )
}
