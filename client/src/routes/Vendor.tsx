import Breadcrumbs from '@/components/forms/Breadcrumbs'
import DataGrid from '@/components/forms/DataGrid'
import ListItem from '@/components/forms/ListItem'
import AddProduct from '@/components/layout/product/CreateEditProduct'
import { fakeVendors } from '@/components/layout/vendor/VendorLayout'
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BreadcrumbItem } from '@heroui/react'
import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export function EmptyState({ add }: { add: React.ReactNode }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto w-24 h-24 text-4xl rounded-full bg-gray-100 flex items-center justify-center">
        <FontAwesomeIcon icon={faFolderOpen} className="text-zinc-400" />
      </div>
      <h3 className="mt-2 font-semibold text-gray-900">No Data Available</h3>
      <p className="mt-1 text-sm text-gray-500">
        There are no items to display at this moment.
      </p>
      <div className="mt-6">{add}</div>
    </div>
  )
}

export default function Vendor({
  hideBreadcrumbs = false,
}: {
  hideBreadcrumbs?: boolean
}) {
  const { vendorId } = useParams()
  const navigate = useNavigate()

  const vendor = useMemo(() => {
    return fakeVendors.find((vendor) => vendor.id === Number(vendorId))
  }, [vendorId])

  return (
    <div className="flex grow flex-col w-full gap-4 p-2">
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
          <BreadcrumbItem>{vendor?.name}</BreadcrumbItem>
        </Breadcrumbs>
      )}

      <DataGrid
        title={`Products (${vendor?.products?.length ?? 0})`}
        addButton={<AddProduct />}
      >
        {vendor?.products?.map((product) => (
          <ListItem
            onClick={() => navigate(`/products/${product.id}`)}
            title={product.name ?? 'Vendor Name'}
            description={vendor?.description ?? 'Vendor Description'}
          />
        ))}
      </DataGrid>
    </div>
  )
}
