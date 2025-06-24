import Breadcrumbs from '@/components/forms/Breadcrumbs'
import { useProductQuery } from '@/routes/Product'
import { useVendorQuery } from '@/routes/Vendor'
import { BreadcrumbItem } from '@heroui/react'
import { useParams } from 'react-router-dom'
import History from '../History'

export default function ProductHistory() {
  const { productId } = useParams()

  const { data: product } = useProductQuery(productId || '')
  const { data: vendor } = useVendorQuery(product?.vendor_id || '')

  return (
    <div className="flex w-full grow flex-col gap-4 p-2">
      <Breadcrumbs>
        <BreadcrumbItem href="/vendors">Vendors</BreadcrumbItem>
        <BreadcrumbItem href={`/vendors/${vendor?.id}`}>
          {vendor?.name}
        </BreadcrumbItem>
        <BreadcrumbItem isDisabled>Products</BreadcrumbItem>
        <BreadcrumbItem href={`/products/${product?.id}`}>
          {product?.name}
        </BreadcrumbItem>
        <BreadcrumbItem>History</BreadcrumbItem>
      </Breadcrumbs>

      <History updates={[]} />
    </div>
  )
}
