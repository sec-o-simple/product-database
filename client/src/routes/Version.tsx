import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import ConfirmButton from '@/components/forms/ConfirmButton'
import { AddRelationshipButton } from '@/components/layout/product/CreateRelationship'
import { VersionProps } from '@/components/layout/version/CreateEditVersion'
import useRefetchQuery from '@/utils/useRefetchQuery'
import useRouter from '@/utils/useRouter'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BreadcrumbItem, Chip, cn } from '@heroui/react'
import { useParams } from 'react-router-dom'
import { useProductQuery } from './Product'
import { useVendorQuery } from './Vendor'
import { ListGroup } from '@/components/forms/ListItem'
import { useTranslation } from 'react-i18next'
import IconButton from '@/components/forms/IconButton'
import DataGrid from '@/components/forms/DataGrid'

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

export function DeleteRelationshipGroup({
  group,
  version,
  onDelete,
}: {
  version: {
    id: string
  }
  group: {
    category: string
    products: {
      version_relationships: {
        id: string
      }[]
    }[]
  }
  onDelete?: () => void
}) {
  const { t } = useTranslation()

  const totalVersions = group.products.reduce((acc, product) => {
    return acc + (product.version_relationships?.length || 0)
  }, 0)

  const deleteMutation = client.useMutation(
    'delete',
    '/api/v1/product-versions/{id}/relationships/{category}',
    {
      onSuccess: () => {
        onDelete?.()
      },
    },
  )

  return (
    <ConfirmButton
      isIconOnly={true}
      variant={'light'}
      radius={'full'}
      isLoading={deleteMutation.isPending}
      color="danger"
      confirmTitle={t('common.confirmDeleteTitle')}
      confirmText={t('common.confirmDeleteText', {
        resource: t('relationship.confirmDeleteResource', {
          category: t(`relationship.category.${group.category}`),
          totalVersions,
        }),
      })}
      onConfirm={() => {
        deleteMutation.mutate({
          params: {
            path: {
              id: version.id,
              category: group.category,
            },
          },
        })
      }}
    >
      <FontAwesomeIcon icon={faTrash} />
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
  const { navigateToModal } = useRouter()

  const { data: version } = useVersionQuery(versionId)
  const { data: product } = useProductQuery(version?.product_id)
  const { data: vendor } = useVendorQuery(product?.vendor_id)
  const relationshipRequest = client.useQuery(
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
  useRefetchQuery(relationshipRequest)
  const relationships = relationshipRequest.data

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
        <DataGrid
          title={`${t('relationship.label', { count: 2 })}`}
          addButton={
            <AddRelationshipButton
              versionId={version.id}
              returnTo={`/product-versions/${version.id}`}
            />
          }
        >
          {relationships?.map((relationship) => (
            <ListGroup
              title={t(`relationship.category.${relationship.category}`)}
              key={relationship.category}
              headerActions={
                <div className="flex gap-1">
                  <IconButton
                    icon={faEdit}
                    onPress={() => {
                      navigateToModal(
                        `/product-versions/${versionId}/relationships/${relationship.category}/edit`,
                        `/product-versions/${versionId}`,
                      )
                    }}
                  />

                  <DeleteRelationshipGroup
                    group={relationship}
                    version={version}
                    onDelete={() => {
                      relationshipRequest.refetch()
                    }}
                  />
                </div>
              }
            >
              {relationship.products
                .slice()
                .sort((a, b) =>
                  a.product.full_name.localeCompare(b.product.full_name),
                )
                .map((product) => (
                  <div
                    key={`${relationship.category}-${product.product.id}`}
                    className={cn(
                      'flex w-full gap-4 bg-white px-4 py-2 border-1 border-default-200',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn('text-lg font-semibold')}>
                          {product.product.full_name}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pb-1">
                      {product.version_relationships?.map((versionRel) => (
                        <Chip key={versionRel.id} variant="solid">
                          {versionRel.version.name}
                        </Chip>
                      ))}
                    </div>
                  </div>
                ))}
            </ListGroup>
          ))}
        </DataGrid>
      </div>
    </div>
  )
}
