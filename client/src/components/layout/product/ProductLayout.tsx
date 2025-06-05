import { faArrowLeft, faFileExport } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button } from '@heroui/button'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import IconButton from '../../forms/IconButton'
import { UserAvatar } from '../TopBarLayout'
import { Attribute, fakeVendors } from '../vendor/VendorLayout'
import AddVersion from './AddVersion'
import History from '@/components/forms/HistoryButton'

export function getProductById(productId: string) {
  return fakeVendors
    .flatMap((vendor) => vendor.products || [])
    .find((product) => String(product.id) === productId)
}

export default function ProductLayout() {
  const { productId } = useParams()
  const navigate = useNavigate()

  const product = getProductById(productId || '')

  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB]">
      <div className="flex w-full items-center justify-between gap-8 border-b px-6 py-4 bg-white">
        <span className="flex items-center gap-2 text-2xl font-bold">
          <IconButton
            icon={faArrowLeft}
            color="primary"
            variant="light"
            isIconOnly={true}
            onPress={() => navigate(-1)}
          />
          <p>Product: {product?.name}</p>
        </span>

        <div className="flex flex-row gap-4">
          <History />

          <Button
            color="primary"
            variant="light"
            disabled
            startContent={<FontAwesomeIcon icon={faFileExport} />}
          >
            Export
          </Button>

          <AddVersion />

          <UserAvatar />
        </div>
      </div>

      <div className="flex flex-row h-full flex-grow">
        <div className="flex w-1/3 max-w-64 flex-col gap-4 border-r bg-white p-4">
          <Attribute label="Name" value={product?.name ?? ''} />

          <Attribute label="Description" value={product?.description ?? ''} />
        </div>

        <div className="p-4 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
