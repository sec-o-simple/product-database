import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import ConfirmButton from '@/components/forms/ConfirmButton'
import DataGrid from '@/components/forms/DataGrid'
import IconButton from '@/components/forms/IconButton'
import LatestChip from '@/components/forms/Latest'
import ListItem from '@/components/forms/ListItem'
import PageContent from '@/components/forms/PageContent'
import { AddVersionButton } from '@/components/layout/version/CreateEditVersion'
import useRouter from '@/utils/useRouter'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BreadcrumbItem, Chip } from '@heroui/react'
import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'

export function getVersions(versionId?: string, productId?: string) {
  const request = versionId
    ? client.useQuery('get', '/api/v1/product-versions/{id}', {
        params: {
          path: {
            id: versionId || '',
          },
        },
      })
    : client.useQuery('get', '/api/v1/products/{id}/versions', {
        params: {
          path: {
            id: productId || '',
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

export function VersionItem({ version }: { version: any }) {
  const {
    params: { productId },
    navigate,
    navigateToModal,
  } = useRouter()

  const handleOnActionClick = (href: string) => navigateToModal(href)

  return (
    <ListItem
      key={version.id}
      onClick={() => navigate(`/products/${productId}/versions/${version.id}`)}
      title={
        <div className="flex gap-2 items-center">
          {version.is_latest && <LatestChip />}

          <p>{version.name}</p>
        </div>
      }
      description={version.description || 'No description'}
      actions={
        <div className="flex flex-row gap">
          <IconButton
            icon={faEdit}
            onPress={() =>
              handleOnActionClick(
                `/products/${productId}/versions/${version.id}/edit`,
              )
            }
          />
          <ConfirmButton
            isIconOnly
            variant="light"
            className="text-neutral-foreground"
            radius="full"
            confirmTitle="Delete Version"
            confirmText="Are you sure you want to delete this Version?"
            onConfirm={() => {}}
          >
            <FontAwesomeIcon icon={faTrash} />
          </ConfirmButton>
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

export default function Product({
  hideBreadcrumbs = false,
}: {
  hideBreadcrumbs?: boolean
}) {
  const { productId } = useParams()

  const { data: product } = client.useQuery('get', `/api/v1/products/{id}`, {
    params: {
      path: {
        id: productId || '',
      },
    },
  })

  const { data: vendor } = client.useQuery('get', `/api/v1/vendors/{id}`, {
    params: {
      path: {
        id: product?.vendor_id || '',
      },
    },
  })

  const { data: versions } = client.useQuery(
    'get',
    `/api/v1/products/{id}/versions`,
    {
      params: {
        path: {
          id: productId || '',
        },
      },
    },
  )

  if (!product) {
    return null
  }

  return (
    <PageContent>
      {!hideBreadcrumbs && (
        <Breadcrumbs>
          <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
          <BreadcrumbItem href={`/vendors/${vendor?.id}`}>
            {vendor?.name}
          </BreadcrumbItem>
          <BreadcrumbItem isDisabled>Products</BreadcrumbItem>
          <BreadcrumbItem>{product?.name}</BreadcrumbItem>
        </Breadcrumbs>
      )}

      <DataGrid
        title={`Versions (${versions?.length})`}
        addButton={<AddVersionButton productId={product.id} />}
      >
        {versions &&
          versions.length > 0 &&
          versions?.map((version) => (
            <VersionItem key={version.id} version={version} />
          ))}
      </DataGrid>
    </PageContent>
  )
}
