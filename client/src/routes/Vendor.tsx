import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import DataGrid from '@/components/forms/DataGrid'
import ListItem from '@/components/forms/ListItem'
import AddProduct from '@/components/layout/vendor/AddProduct'
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BreadcrumbItem } from '@heroui/react'
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

  const { data: vendor } = client.useQuery(
    'get',
    `/api/v1/vendors/{id}`,
    {
      params: {
        path: {
          id: vendorId || '',
        }
      }
    }
  )

  const { data: products } = client.useQuery(
    'get',
    '/api/v1/vendors/{id}/products',
    {
      params: {
        path: {
          id: vendorId || '',
        }
      }
    }
  )

  if (!vendor) {
    return null
  }

  return (
    <div className="flex grow flex-col w-full gap-4 p-2">
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
          <BreadcrumbItem>Products</BreadcrumbItem>
        </Breadcrumbs>
      )}

      <DataGrid
        title={`Products (${products?.length ?? 0})`}
        addButton={<AddProduct vendorId={vendor.id} />}
      >
        {!products || products.length === 0 ? null : products.map((product) => (
          <ListItem
            key={product.id}
            onClick={() => navigate(`/products/${product.id}`)}
            title={product.name ?? 'Product Name'}
            description={product.description ?? 'Vendor Description'}
          />
        ))}
      </DataGrid>
    </div>
  )
}
