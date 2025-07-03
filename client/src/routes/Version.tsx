import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import ConfirmButton from '@/components/forms/ConfirmButton'
import { AddRelationshipButton } from '@/components/layout/product/CreateRelationship'
import { VersionProps } from '@/components/layout/version/CreateEditVersion'
import { EmptyState } from '@/components/table/EmptyState'
import useRefetchQuery from '@/utils/useRefetchQuery'
import useRouter from '@/utils/useRouter'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BreadcrumbItem } from '@heroui/react'
import { useParams } from 'react-router-dom'
import { useProductQuery } from './Product'
import { useVendorQuery } from './Vendor'
import ListItem, { ListGroup } from '@/components/forms/ListItem'
import { useTranslation } from 'react-i18next'

export function useVersionQuery(versionId?: string) {
  const request = client.useQuery(
    'get',
    '/api/v1/product-versions/{id}',
    {
      params: {
        path: {
          id: versionId || '',
        },
      },
    },
    {
      enabled: !!versionId,
    },
  )

  useRefetchQuery(request)
  return request
}

export function DeleteVersion({
  version,
  isIconButton,
  returnTo,
}: {
  version: VersionProps
  isIconButton?: boolean
  returnTo?: string
}) {
  const mutation = client.useMutation('delete', `/api/v1/product-versions/{id}`)
  const {
    navigate,
    params: { productId },
  } = useRouter()
  const { t } = useTranslation()

  return (
    <ConfirmButton
      isIconOnly={isIconButton}
      variant={isIconButton ? 'light' : 'solid'}
      radius={isIconButton ? 'full' : 'md'}
      color="danger"
      confirmTitle="Delete Version"
      confirmText={`Are you sure you want to delete the version "${version.name}"? This action cannot be undone.`}
      onConfirm={() => {
        mutation.mutate({
          params: { path: { id: version.id?.toString() ?? '' } },
        })

        navigate(returnTo ?? `/products/${productId || ''}`, {
          state: {
            shouldRefetch: true,
            message: `Version "${version.name}" has been deleted successfully.`,
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

/**
 *
 * @param hideBreadcrumbs - Whether to hide the breadcrumbs at the top of the page.
 * @returns
 */
export default function Version({
  hideBreadcrumbs = false,
}: {
  hideBreadcrumbs?: boolean
}) {
  const { versionId } = useParams()
  const { t } = useTranslation()

  const { data: version } = useVersionQuery(versionId)
  const { data: product } = useProductQuery(version?.product_id)
  const { data: vendor } = useVendorQuery(product?.vendor_id)
  const { data: relationships } = client.useQuery(
    'get',
    `/api/v1/product-versions/{id}/relationships`,
    {
      params: {
        path: {
          id: versionId || '',
        },
      },
    },
  )

  if (!version || !product || !vendor) {
    return null
  }

  return (
    <div className="flex w-full grow flex-col gap-4 p-2">
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">
            {t('vendor.label', { count: 2 })}
          </BreadcrumbItem>
          <BreadcrumbItem>{vendor?.name}</BreadcrumbItem>
          <BreadcrumbItem isDisabled>
            {t('product.label', { count: 2 })}
          </BreadcrumbItem>
          <BreadcrumbItem href={`/products/${product?.id}`}>
            {product?.name}
          </BreadcrumbItem>
          <BreadcrumbItem isDisabled>
            {t('version.label', { count: 2 })}
          </BreadcrumbItem>
          <BreadcrumbItem>{version?.name}</BreadcrumbItem>
        </Breadcrumbs>
      )}

      <div className="flex w-full flex-col items-center gap-4">
        <EmptyState
          add={
            <AddRelationshipButton
              versionId={version.id}
              returnTo={`/product-versions/${version.id}`}
            />
          }
        />
        {relationships?.map((relationship) => (
          <ListGroup title={relationship.category} key={relationship.category}>
            {relationship.products.map((product) => (
              <ListItem
                key={`${relationship.category}-${product.product.id}`}
                classNames={{
                  base: 'border-default-200 border-b-0 rounded-none',
                }}
                title={
                  <div className="flex items-center gap-2">
                    {/* {version.id === 1 && <LatestChip />} */}
                    <p>{product.product.full_name}</p>
                  </div>
                }
                description={t('common.noDescription')}
              />
            ))}
          </ListGroup>
        ))}
      </div>
    </div>
  )
}
