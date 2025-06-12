import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import { BreadcrumbItem } from '@heroui/react'
import { useParams } from 'react-router-dom'
import History from '../History'

export default function VersionHistory() {
  const { productId, versionId } = useParams()

  const { data: version } = client.useQuery(
    'get',
    `/api/v1/products/{id}/versions/{versionID}`,
    {
      params: {
        path: {
          id: productId || '',
          versionID: versionId || '',
        },
      },
    },
  )

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

  return (
    <div className="flex grow flex-col w-full gap-4 p-2">
      <Breadcrumbs>
        <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
        <BreadcrumbItem>{vendor?.name}</BreadcrumbItem>
        <BreadcrumbItem isDisabled>Products</BreadcrumbItem>
        <BreadcrumbItem href={`/products/${product?.id}`}>
          {product?.name}
        </BreadcrumbItem>
        <BreadcrumbItem isDisabled>Versions</BreadcrumbItem>
        <BreadcrumbItem
          href={`/products/${product?.id}/versions/${version?.id}`}
        >
          {version?.name}
        </BreadcrumbItem>
        <BreadcrumbItem>History</BreadcrumbItem>
      </Breadcrumbs>

      <History updates={[]} />
    </div>
  )
}
