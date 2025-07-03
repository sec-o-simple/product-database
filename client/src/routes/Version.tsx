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
}: {
  version: {
    full_name: string
  }
  group: {
    category: string
    products: {
      product: {
        description?: string
        full_name: string
        id: string
        latest_versions?: {
          description?: string
          full_name: string
          id: string
          is_latest: boolean
          name: string
          predecessor_id?: string | null
          product_id?: string
          released_at?: string | null
        }[]
        name: string
        type: string
        vendor_id?: string
      }
      version_relationships: {
        id: string
        version: {
          description?: string
          full_name: string
          id: string
          is_latest: boolean
          name: string
          predecessor_id?: string | null
          product_id?: string
          released_at?: string | null
        }
      }[]
    }[]
  }
}) {
  const totalVersions = group.products.reduce((acc, product) => {
    return acc + (product.version_relationships?.length || 0)
  }, 0)

  return (
    <ConfirmButton
      isIconOnly={true}
      variant={'light'}
      radius={'full'}
      color="danger"
      confirmTitle="Delete Relationship Group"
      confirmText={`Are you sure you want to delete the "${group.category}" relationship from "${version.full_name}" to ${totalVersions} version${totalVersions !== 1 ? 's' : ''}? This action cannot be undone.`}
      onConfirm={() => {}}
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
              title={relationship.category}
              key={relationship.category}
              headerActions={
                <div className="flex gap-1">
                  <IconButton icon={faEdit} onPress={() => {}} />

                  <DeleteRelationshipGroup
                    group={relationship}
                    version={version}
                  />
                </div>
              }
            >
              {relationship.products.map((product) => (
                <div
                  key={`${relationship.category}-${product.product.id}`}
                  className={cn(
                    'flex w-full gap-4 rounded-lg bg-white px-4 py-2 border-1 border-default-200',
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
