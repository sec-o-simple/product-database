import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import ConfirmButton from '@/components/forms/ConfirmButton'
import DataGrid from '@/components/forms/DataGrid'
import PageContent from '@/components/forms/PageContent'
import {
  AddProductButton,
  ProductProps,
} from '@/components/layout/product/CreateEditProduct'
import useRouter from '@/utils/useRouter'
import { faFolderOpen, faTrash } from '@fortawesome/free-solid-svg-icons'
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
            id: productId || '',
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

export function DeleteVendor({
  vendor,
  isIconButton,
}: {
  vendor: VendorProps
  isIconButton?: boolean
}) {
  const mutation = client.useMutation('delete', '/api/v1/vendors/{id}')
  const { navigate } = useRouter()

  return (
    <ConfirmButton
      isIconOnly={isIconButton}
      variant={isIconButton ? 'light' : 'solid'}
      radius={isIconButton ? 'full' : 'md'}
      color="danger"
      confirmTitle="Delete Vendor"
      confirmText={`Are you sure you want to delete the vendor "${vendor.name}"? This action cannot be undone.`}
      onConfirm={() => {
        mutation.mutate({
          params: { path: { id: vendor.id?.toString() ?? '' } },
        })

        navigate('/vendors', {
          state: {
            shouldRefetch: true,
            message: `Vendor "${vendor.name}" has been deleted successfully.`,
            type: 'success',
          },
        })
      }}
    >
      <FontAwesomeIcon icon={faTrash} />
      {!isIconButton && 'Delete'}
    </ConfirmButton>
  )
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
