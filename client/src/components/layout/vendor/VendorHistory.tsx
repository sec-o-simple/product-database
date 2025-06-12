import client from '@/client'
import Breadcrumbs from '@/components/forms/Breadcrumbs'
import { BreadcrumbItem } from '@heroui/react'
import { useParams } from 'react-router-dom'
import History from '../History'

export default function VendorHistory() {
  const { vendorId } = useParams()

  const { data: vendor } = client.useQuery('get', `/api/v1/vendors/{id}`, {
    params: {
      path: {
        id: vendorId || '',
      },
    },
  })

  return (
    <div className="flex grow flex-col w-full gap-4 p-2">
      <Breadcrumbs>
        <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
        <BreadcrumbItem href={`/vendors/${vendor?.id}`}>
          {vendor?.name}
        </BreadcrumbItem>
        <BreadcrumbItem>History</BreadcrumbItem>
      </Breadcrumbs>

      <History updates={[]} />
    </div>
  )
}
