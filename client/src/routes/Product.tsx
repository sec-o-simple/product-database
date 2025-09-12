import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import ConfirmButton from '@/components/forms/ConfirmButton'
import DataGrid from '@/components/forms/DataGrid'
import IconButton from '@/components/forms/IconButton'
import LatestChip from '@/components/forms/Latest'
import ListItem from '@/components/forms/ListItem'
import PageContent from '@/components/forms/PageContent'
import { AddVersionButton } from '@/components/layout/version/CreateEditVersion'
import useRefetchQuery from '@/utils/useRefetchQuery'
import useRouter from '@/utils/useRouter'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BreadcrumbItem, Chip } from '@heroui/react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useVendorQuery } from './Vendor'
import { DeleteVersion } from './Version'

export function useProductQuery(productId?: string) {
  const request = client.useQuery(
    'get',
    '/api/v1/products/{id}',
    {
      params: {
        path: {
          id: productId || '',
        },
      },
    },
    {
      enabled: !!productId?.length,
    },
  )

  useRefetchQuery(request)
  return request
}

export function DeleteProduct({
  product,
  isIconButton,
}: {
  product: { name: string; id: string; vendor_id?: string }
  isIconButton?: boolean
}) {
  const mutation = client.useMutation('delete', '/api/v1/products/{id}')
  const { navigate } = useRouter()
  const { t } = useTranslation()

  return (
    <ConfirmButton
      isIconOnly={isIconButton}
      variant={isIconButton ? 'light' : 'solid'}
      radius={isIconButton ? 'full' : 'md'}
      color="danger"
      confirmTitle={t('product.delete.title')}
      confirmText={t('product.delete.text', { name: product.name })}
      onConfirm={() => {
        mutation.mutate({
          params: { path: { id: product.id?.toString() ?? '' } },
        })

        navigate(`/vendors/${product.vendor_id}`, {
          state: {
            shouldRefetch: true,
            message: t('product.delete.success', { name: product.name }),
            type: 'success',
          },
        })
      }}
    >
      <FontAwesomeIcon icon={faTrash} />
      {!isIconButton && t('common.delete')}
    </ConfirmButton>
  )
}

export function useVersionListQuery(productId?: string) {
  const request = client.useQuery(
    'get',
    '/api/v1/products/{id}/versions',
    {
      params: {
        path: {
          id: productId || '',
        },
      },
    },
    {
      enabled: !!productId,
    },
  )
  useRefetchQuery(request)
  return request
}

export function VersionItem({
  version,
}: {
  version: {
    id: string
    name: string
    description?: string
    release_date?: string
    is_latest?: boolean
  }
}) {
  const {
    params: { productId },
    navigate,
    navigateToModal,
  } = useRouter()

  const handleOnActionClick = (href: string) =>
    navigateToModal(href, `/products/${productId}`)
  const { t } = useTranslation()

  return (
    <ListItem
      id={version.id}
      key={version.id}
      onClick={() => navigate(`/product-versions/${version.id}`)}
      title={
        <div className="flex items-center gap-2">
          {version.is_latest && <LatestChip />}

          <p>{version.name}</p>
        </div>
      }
      description={version.description || t('common.noDescription')}
      actions={
        <div className="flex flex-row gap-1">
          <IconButton
            icon={faEdit}
            onPress={() =>
              handleOnActionClick(`/product-versions/${version.id}/edit`)
            }
          />

          <DeleteVersion
            version={version}
            isIconButton
            returnTo={`/products/${productId}`}
          />
        </div>
      }
      chips={
        version.release_date && [
          <Chip key="version" variant="solid">
            {version.release_date}
          </Chip>,
        ]
      }
    />
  )
}

/**
 *
 * @param productId - The ID of the product to display. If not provided, it will be taken from the URL.
 * @param hideBreadcrumbs - Whether to hide the breadcrumbs navigation. Defaults to false.
 * @returns
 */
export default function Product({
  productId,
  hideBreadcrumbs = false,
}: {
  productId?: string
  hideBreadcrumbs?: boolean
}) {
  const { productId: paramProductId } = useParams()
  let productIdParam = productId
  const { t } = useTranslation()

  if (!productIdParam) {
    productIdParam = paramProductId
  }

  const { data: product } = useProductQuery(productIdParam || '')
  const { data: vendor } = useVendorQuery(product?.vendor_id || '')
  const { data: versions } = useVersionListQuery(product?.id)

  if (!product) {
    return null
  }

  return (
    <PageContent>
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">
            {t('vendor.label', { count: 2 })}
          </BreadcrumbItem>
          <BreadcrumbItem href={`/vendors/${vendor?.id}`}>
            {vendor?.name}
          </BreadcrumbItem>
          <BreadcrumbItem isDisabled>
            {t('product.label', { count: 2 })}
          </BreadcrumbItem>
          <BreadcrumbItem>{product?.name}</BreadcrumbItem>
        </Breadcrumbs>
      )}

      <DataGrid
        title={`${t('version.label', { count: versions?.length || 0 })} (${versions?.length})`}
        addButton={
          <AddVersionButton
            productId={product?.id || ''}
            returnTo={`/products/${product.id}`}
          />
        }
      >
        {versions?.map((version) => (
          <VersionItem key={version.id} version={version} />
        ))}
      </DataGrid>
    </PageContent>
  )
}
