import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import DataGrid from '@/components/forms/DataGrid'
import PageContent from '@/components/forms/PageContent'
import {
  AddProductButton,
  ProductProps,
} from '@/components/layout/product/CreateEditProduct'
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BreadcrumbItem } from '@heroui/react'
import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { ProductItem } from './Products'
import { getVendors, VendorProps } from './Vendors'

export function EmptyState({ add }: { add?: React.ReactNode }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="mx-auto w-24 h-24 text-4xl rounded-full bg-gray-100 flex items-center justify-center">
        <FontAwesomeIcon icon={faFolderOpen} className="text-zinc-400" />
      </div>
      <h3 className="mt-2 font-semibold text-gray-900">No Data Available</h3>
      <p className="mt-1 text-sm text-gray-500">
        There are no items to display at this moment.
      </p>
      {add && <div className="mt-6">{add}</div>}
    </div>
  )
}

export function getProducts(vendorId?: string, productId?: string) {
  const request = productId
    ? client.useQuery('get', '/api/v1/products/{id}', {
        params: {
          path: {
            id: vendorId || '',
            productId: productId || '',
          },
        },
      })
    : client.useQuery('get', '/api/v1/vendors/{id}/products', {
        params: {
          path: {
            id: vendorId || '',
          },
        },
      })

  const location = useLocation()
  useEffect(() => {
    if (location.state && location.state.shouldRefetch) {
      request.refetch()
    }
  }, [location])

  return request
}

export default function Vendor({
  hideBreadcrumbs = false,
}: {
  hideBreadcrumbs?: boolean
}) {
  const { vendorId } = useParams()
  const { data: vendor } = getVendors(vendorId) as {
    data: VendorProps
  }

  const { data: products } = getProducts(vendorId) as {
    data: ProductProps[]
  }

  return (
    <PageContent>
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
          <BreadcrumbItem>{vendor?.name}</BreadcrumbItem>
        </Breadcrumbs>
      )}

      <DataGrid
        title={`Products (${products?.length ?? 0})`}
        addButton={<AddProductButton vendorId={vendor?.id ?? ''} />}
      >
        {products &&
          products.length > 0 &&
          products.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
      </DataGrid>
    </PageContent>
  )
}
