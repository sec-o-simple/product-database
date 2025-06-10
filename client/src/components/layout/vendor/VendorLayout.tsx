import client from '@/client'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import IconButton from '../../forms/IconButton'
import AddProduct from './AddProduct'

export function Attribute({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-100 rounded-lg p-4 space-y-2">
      <div>
        <p className="font-bold">{label}</p>
      </div>

      <div className="flex justify-end">
        <p>{value}</p>
      </div>
    </div>
  )
}

export default function VendorLayout() {
  const { vendorId } = useParams()
  const navigate = useNavigate()

  const { data: vendor } = client.useQuery('get', `/api/v1/vendors/{id}`, {
    params: {
      path: {
        id: vendorId || '',
      },
    },
  })

  if (!vendor) {
    return null
  }

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
          <p>Vendor: {vendor.name}</p>
        </span>

        <div className="flex flex-row gap-4">
          <AddProduct vendorBranchId={vendor.id} />
        </div>
      </div>

      <div className="flex flex-row h-full">
        <div className="flex w-1/3 max-w-64 flex-col gap-4 border-r bg-white p-4">
          <Attribute label="Name" value={vendor.name} />

          <Attribute label="Description" value={vendor.description || '-/-'} />
        </div>
        <div className="p-4 w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
