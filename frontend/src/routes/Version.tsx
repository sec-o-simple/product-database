import LatestChip from '@/components/forms/Latest'
import ListItem from '@/components/forms/ListItem'
import { fakeVendors } from '@/components/layout/vendor/VendorLayout'
import Pagination from '@/components/table/Pagination'
import { useParams } from 'react-router-dom'

export default function Version() {
  const { productId } = useParams()
  // find the correct product by id
  const product = fakeVendors
    .find((vendor) =>
      vendor.products?.some((product) => String(product.id) === productId),
    )
    ?.products?.find((product) => String(product.id) === productId)

  return (
    <div className="flex grow flex-col w-full gap-4 p-2">
      <p className="font-semibold text-xl">
        Versions ({product?.versions?.length ?? 0})
      </p>

      <div className="flex w-full flex-col items-center gap-4">
        {product?.versions?.map((version) => (
          <ListItem
            key={version.id}
            title={
              <div className="flex gap-2 items-center">
                {version.id === 1 && <LatestChip />}

                <p>{version.name}</p>
              </div>
            }
            description={version.description}
          />
        ))}
        <Pagination />
      </div>
    </div>
  )
}
