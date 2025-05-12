import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import IconButton from '../../forms/IconButton'
import { UserAvatar } from '../TopBarLayout'
import { Attribute } from '../vendor/VendorLayout'
import AddVersion from './AddVersion'

export default function ProductLayout() {
  const { vendorId } = useParams()
  const navigate = useNavigate()

  const product = {
    id: 1,
    name: 'Product 1',
    description: 'Product 1 description',
    vendorId: vendorId,
  }

  return (
    <div className="flex h-screen flex-col bg-[#F9FAFB]">
      <div className="flex w-full items-center justify-between gap-8 border-b px-6 py-4 bg-white">
        <span className="flex items-center gap-2 text-2xl font-bold">
          <IconButton
            icon={faArrowLeft}
            color="primary"
            variant="light"
            isIconOnly={true}
            onPress={() => navigate(-1)}
          />
          <p>Product: {product?.id}</p>
        </span>

        <div className="flex flex-row gap-4">
          <AddVersion />

          <UserAvatar />
        </div>
      </div>

      <div className="flex flex-row h-full">
        <div className="flex w-1/3 max-w-64 flex-col gap-4 border-r bg-white p-4">
          <Attribute label="Name" value={product?.name} />

          <Attribute label="Description" value={product?.description} />
        </div>
        <div className="p-4 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
