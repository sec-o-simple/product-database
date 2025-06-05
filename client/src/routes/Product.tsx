import Breadcrumbs from '@/components/forms/Breadcrumbs'
import DataGrid from '@/components/forms/DataGrid'
import LatestChip from '@/components/forms/Latest'
import ListItem from '@/components/forms/ListItem'
import PageContainer from '@/components/forms/PageContainer'
import AddVersion from '@/components/layout/product/AddVersion'
import { fakeVendors } from '@/components/layout/vendor/VendorLayout'
import { BreadcrumbItem, Chip } from '@heroui/react'
import { useNavigate, useParams } from 'react-router-dom'

export default function Product({
  hideBreadcrumbs = false,
}: {
  hideBreadcrumbs?: boolean
}) {
  const { productId } = useParams()
  const navigate = useNavigate()

  // find the correct product by id
  const vendor = fakeVendors.find((vendor) =>
    vendor.products?.some((product) => String(product.id) === productId),
  )
  const product = vendor?.products?.find(
    (product) => String(product.id) === productId,
  )

  return (
    <PageContainer>
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
          <BreadcrumbItem>{vendor?.name}</BreadcrumbItem>
          <BreadcrumbItem>Products</BreadcrumbItem>
          <BreadcrumbItem>{product?.name}</BreadcrumbItem>
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
            chips={
              <div className="flex flex-row gap-2">
                <Chip className="rounded-md" size="sm" variant="flat">
                  Installed On: Microsoft Office 2019
                </Chip>
                <Chip className="rounded-md" size="sm" variant="flat">
                  Installed On: Microsoft Office 365
                </Chip>
              </div>
            }
          />
        ))}
      </DataGrid>
    </PageContainer>
  )
}
