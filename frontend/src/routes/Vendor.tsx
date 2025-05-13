import Breadcrumbs from '@/components/forms/Breadcrumbs'
import ListItem from '@/components/forms/ListItem'
import { fakeVendors } from '@/components/layout/vendor/VendorLayout'
import Pagination from '@/components/table/Pagination'
import { BreadcrumbItem } from '@heroui/react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function Products() {
  const { vendorId } = useParams()
  const navigate = useNavigate()

  const vendor = useMemo(() => {
    return fakeVendors.find((vendor) => vendor.id === Number(vendorId))
  }, [vendorId])

  return (
    <div className="flex grow flex-col w-full gap-4 p-2">
      <Breadcrumbs>
        <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
        <BreadcrumbItem>Products</BreadcrumbItem>
      </Breadcrumbs>

      <p className="font-semibold text-xl">
        Products ({vendor?.products?.length ?? 0})
      </p>

      <div className="flex w-full flex-col items-center gap-4">
        {vendor?.products?.map((product) => (
          <ListItem
            onClick={() => navigate(`/products/${product.id}`)}
            title={vendor?.name ?? 'Vendor Name'}
            description={vendor?.description ?? 'Vendor Description'}
          />
        ))}
        <Pagination />
      </div>
    </div>
  )
}
