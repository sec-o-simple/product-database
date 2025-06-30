import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import ConfirmButton from '@/components/forms/ConfirmButton'
import DataGrid from '@/components/forms/DataGrid'
import PageContent from '@/components/forms/PageContent'
import { AddProductButton } from '@/components/layout/product/CreateEditProduct'
import useRefetchQuery from '@/utils/useRefetchQuery'
import useRouter from '@/utils/useRouter'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BreadcrumbItem } from '@heroui/react'
import { useParams } from 'react-router-dom'
import { ProductItem, useVendorProductListQuery } from './Products'
import { VendorProps } from './Vendors'
import { useTranslation } from 'react-i18next'

export function useVendorQuery(vendorId?: string) {
  const request = client.useQuery(
    'get',
    '/api/v1/vendors/{id}',
    {
      params: {
        path: {
          id: vendorId || '',
        },
      },
    },
    {
      enabled: !!vendorId,
    },
  )

  useRefetchQuery(request)

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
  const { t } = useTranslation()

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
      {!isIconButton && t('Delete')}
    </ConfirmButton>
  )
}

/**
 *
 * @param vendorId - The ID of the vendor to display. If not provided, it will be taken from the URL parameters.
 * @param hideBreadcrumbs - If true, the breadcrumbs will not be displayed.
 * @returns
 */
export default function Vendor({
  vendorId,
  hideBreadcrumbs = false,
}: {
  vendorId?: string
  hideBreadcrumbs?: boolean
}) {
  const { vendorId: paramVendorId } = useParams()
  const { t } = useTranslation()
  let vendorIdParam = vendorId

  if (!vendorIdParam) {
    vendorIdParam = paramVendorId
  }

  const { data: vendor } = useVendorQuery(vendorIdParam || '')
  const { data: products } = useVendorProductListQuery(vendorIdParam || '')

  return (
    <PageContent>
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">{t('Vendors')}</BreadcrumbItem>
          <BreadcrumbItem>{vendor?.name}</BreadcrumbItem>
        </Breadcrumbs>
      )}

      <DataGrid
        title={`${t('Products')} (${products?.length})`}
        addButton={<AddProductButton vendorId={vendor?.id || ''} />}
      >
        {products?.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </DataGrid>
    </PageContent>
  )
}
