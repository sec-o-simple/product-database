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
      {!isIconButton && 'Delete'}
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
  const { productId, versionId } = useParams()

  const { data: product } = useProductQuery(productId || '')
  const { data: vendor } = useVendorQuery(product.vendor_id || '')
  const { data: version } = useVersionQuery(versionId)
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

  return (
    <div className="flex grow flex-col w-full gap-4 p-2">
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
          <BreadcrumbItem>{vendor?.name}</BreadcrumbItem>
          <BreadcrumbItem isDisabled>Products</BreadcrumbItem>
          <BreadcrumbItem href={`/products/${product?.id}`}>
            {product?.name}
          </BreadcrumbItem>
          <BreadcrumbItem isDisabled>Versions</BreadcrumbItem>
          <BreadcrumbItem>{version?.name}</BreadcrumbItem>
        </Breadcrumbs>
      )}

      <div className="flex w-full flex-col items-center gap-4">
        <EmptyState add={<AddRelationshipButton />} />
        {/* {version.source_relationships?.map((relationship) => (
          <ListGroup title={relationship.category} key={`${relationship.category}-${relationship.id}`}>
            <ListItem
              classNames={{
                base: 'border-default-200 border-b-0 rounded-none',
              }}
              title={
                <div className="flex gap-2 items-center">
                  {version.id === 1 && <LatestChip />}

                  <p>{relationship.target_branch_name}</p>
                </div>
              }
              description={'No description'}
            />
          </ListGroup>
        ))} */}
      </div>
    </div>
  )
}
